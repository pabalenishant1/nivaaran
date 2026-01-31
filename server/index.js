const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Setup Uploads for OCR
const upload = multer({ dest: 'uploads/' });

// In-Memory Store (Single Source of Truth)
let cases = [];

async function generateAISummary(patientData, ocrText) {
  const text = String(ocrText || '');
  const lines = text.split(/\r?\n/);
  const indicators = /(Tab\.|TAB\.|Cap\.|CAP\.|Tablet|Capsule|Syrup|Inj)\b/;
  const dosage = /\b(\d{2,4})\s*(mg|ml)\b/i;
  const numbered = /^\s*\d+[\.\)]\s+/;
  const freqNoise = new Set(['rx','tid','bid','od','sos','hs','po','im','iv','qhs','prn']);
  const blacklist = [
    'road','center','hospital','pune','phase','mg','business',
    'morning','night','days','after','food','before','tot',
    'reg','no','date','age','gender','weight','height'
  ];
  const set = new Set();
  const isBlacklisted = (name) => {
    const tokens = String(name).toLowerCase().split(/\s+/);
    return tokens.some(t => blacklist.includes(t));
  };
  const pushName = (raw) => {
    const name = String(raw).replace(/[^A-Za-z\- ]/g,'').trim();
    if (!name) return;
    if (isBlacklisted(name)) return;
    if (freqNoise.has(name.toLowerCase())) return;
    set.add(name);
  };
  for (const line of lines) {
    const hasIndicator = indicators.test(line);
    const hasDosage = dosage.test(line);
    const isNumbered = numbered.test(line);
    if (hasIndicator) {
      const indMatches = [...line.matchAll(/(?:Tab\.|TAB\.|Cap\.|CAP\.|Tablet|Capsule|Syrup|Inj)\s+([A-Za-z][A-Za-z\-]+(?:\s+[A-Za-z][A-Za-z\-]+)*)/g)];
      for (const m of indMatches) pushName(m[1]);
    }
    if (hasDosage) {
      const doseMatches = [...line.matchAll(/([A-Za-z][A-Za-z\-]+(?:\s+[A-Za-z][A-Za-z\-]+)*)\s+\d{2,4}\s*(mg|ml)\b/gi)];
      for (const m of doseMatches) pushName(m[1]);
    }
    if (isNumbered) {
      const numberedCaps = [...line.matchAll(/\b([A-Z][a-zA-Z\-]+(?:\s+[A-Z][a-zA-Z\-]+)*)\b/g)];
      if (numberedCaps.length) pushName(numberedCaps[0][1]);
    }
  }
  const meds = Array.from(set);
  const medsStr = meds.length ? meds.join(', ') : 'Not mentioned';
  let context = '';
  if (patientData.complaint && patientData.duration) {
    context = `${patientData.complaint} for ${patientData.duration}`;
  } else if (patientData.complaint) {
    context = patientData.complaint;
  } else if (meds.length) {
    context = `Medication evidence present`;
  }
  const summary =
    `Patient Summary:\n` +
    `- Age/Gender: ${patientData.age}/${patientData.gender}\n` +
    `- Chief Complaint: ${patientData.complaint}\n` +
    `- Duration: ${patientData.duration}\n` +
    `- Relevant Past History: ${patientData.history}\n` +
    `- Current Medications (inferred): ${medsStr}\n` +
    `- Key Clinical Context: ${context || 'Not available'}\n` +
    `- Red Flags: None`;
  return `[AI-ASSISTED – RULE-BASED MVP]\n${summary}`;
}

// ROOT
app.get('/', (req, res) => {
  res.send('Nivaaran API is running');
});

// PART 4: BACKEND API CONTRACT

// 1. POST /create-case
// Handles Patient Input + Image Upload -> OCR -> AI Summary
// Form-data path: handles file upload -> OCR -> AI summary
app.post('/create-case', upload.array('prescription'), async (req, res) => {
  try {
    const { name, age, gender, complaint, duration, history, language } = req.body;
    const files = req.files || [];

    console.log(`Received case for ${gender}, ${age}. Lang: ${language}`);

    let ocrText = "";

    // Step 1: Perform OCR if files exist
    if (Array.isArray(files) && files.length > 0) {
      const worker = await createWorker('eng');
      try {
        const texts = [];
        for (const f of files) {
          console.log(`Processing OCR for file: ${f.originalname}`);
          try {
            const ret = await worker.recognize(f.path);
            texts.push(ret.data.text || '');
          } catch (ocrErr) {
            console.error("OCR Failed for file:", f.originalname, ocrErr);
          } finally {
            if (fs.existsSync(f.path)) {
              fs.unlinkSync(f.path);
            }
          }
        }
        ocrText = texts.filter(Boolean).join('\n\n');
      } catch (err) {
        console.error("OCR batch failed:", err);
      } finally {
        try { await worker.terminate(); } catch {}
      }
    }

    // Pass real OCR text or empty string only

    // Step 2: AI Summary
    const normalizedPatient = {
      name: name ?? '',
      age: age ?? '',
      gender: gender ?? '',
      complaint: complaint ?? '',
      duration: duration ?? '',
      history: history ?? '',
      language: language ?? ''
    };
    const aiSummary = await generateAISummary(normalizedPatient, ocrText || '');

    const newCase = {
      case_id: crypto.randomUUID(),
      patient_inputs: { 
        name: normalizedPatient.name,
        age: normalizedPatient.age, 
        gender: normalizedPatient.gender, 
        complaint: normalizedPatient.complaint, 
        duration: normalizedPatient.duration, 
        history: normalizedPatient.history, 
        language: normalizedPatient.language 
      },
      ocr_text: ocrText,
      ai_summary: aiSummary,
      doctor_notes: "",
      status: "ready",
      timestamp: new Date()
    };

    cases.push(newCase);
    console.log("New Case Created:", newCase.case_id);

    res.json({ case_id: newCase.case_id, status: "ready" });

  } catch (error) {
    console.error("Error creating case:", error);
    res.status(500).json({ error: "Failed to process case" });
  }
});

// 2. GET /cases
// Returns all cases for the Doctor View
app.get('/cases', (req, res) => {
  res.json(cases);
});

// Aliases using /api prefix for Next.js-friendly paths
app.get('/api/cases', (req, res) => {
  res.json(cases);
});

// JSON path: accepts pre-extracted ocrText and patientData
app.post('/api/create-case', async (req, res) => {
  try {
  const { patientData, ocrText } = req.body || {};
    if (!patientData) {
      return res.status(400).json({ error: 'Missing patientData' });
    }

    // Normalize keys from JSON payload (map alternates explicitly)
    const name = patientData.name ?? '';
    const age = patientData.age ?? '';
    const gender = patientData.gender ?? '';
    const complaint = patientData.complaint ?? patientData.chiefComplaint ?? '';
    const duration = patientData.duration ?? patientData.symptomDuration ?? '';
    const history = patientData.history ?? patientData.medicalHistory ?? '';
    const language = patientData.language ?? '';
    const text = ocrText || '';

    const normalizedPatient = { name, age, gender, complaint, duration, history, language };
    const aiSummary = await generateAISummary(normalizedPatient, text);

    const newCase = {
      case_id: crypto.randomUUID(),
      patient_inputs: { name, age, gender, complaint, duration, history, language },
      ocr_text: text,
      ai_summary: aiSummary,
      doctor_notes: '',
      status: 'ready',
      timestamp: new Date(),
    };

    cases.push(newCase);
    res.json({ success: true, case_id: newCase.case_id });
  } catch (error) {
    console.error('Error creating case (JSON):', error);
    res.status(500).json({ error: 'Failed to process case' });
  }
});

// 3. POST /doctor-notes
app.post('/doctor-notes', (req, res) => {
  const { case_id, doctor_notes } = req.body;
  const patientCase = cases.find(c => c.case_id === case_id);
  
  if (patientCase) {
    patientCase.doctor_notes = doctor_notes;
    res.json({ status: "updated" });
  } else {
    res.status(404).json({ error: "Case not found" });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 EXPRESS SERVER RUNNING ON PORT ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});
