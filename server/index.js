const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 4000;

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

// Mock AI Function (Replace with OpenAI call later)
const generateMockSummary = (patientData, ocrText) => {
    const { age, gender, complaint, duration, history, language } = patientData;
    
    // Simulate processing delay
    return `
**Patient Summary**
- **Demographics**: ${age} years, ${gender}
- **Language**: ${language}
- **Chief Complaint**: ${complaint} (${duration})
- **History**: ${history}

**OCR Extraction**:
${ocrText ? ocrText.substring(0, 100) + (ocrText.length > 100 ? '...' : '') : 'No readable text found.'}

**AI Assessment (MOCK)**:
Patient presents with ${complaint} for ${duration}. History of ${history}.
Recommended to check vitals and consider standard protocol for these symptoms.
    `.trim();
};

// ROOT
app.get('/', (req, res) => {
  res.send('Nivaaran API is running');
});

// PART 4: BACKEND API CONTRACT

// 1. POST /create-case
// Handles Patient Input + Image Upload -> OCR -> AI Summary
app.post('/create-case', upload.single('prescription'), async (req, res) => {
  try {
    const { age, gender, complaint, duration, history, language } = req.body;
    const file = req.file;

    console.log(`Received case for ${gender}, ${age}. Lang: ${language}`);

    let ocrText = "";

    // Step 1: Perform OCR if file exists
    if (file) {
        console.log(`Processing OCR for file: ${file.originalname}`);
        try {
            const worker = await createWorker('eng'); 
            const ret = await worker.recognize(file.path);
            ocrText = ret.data.text;
            await worker.terminate();
        } catch (ocrErr) {
            console.error("OCR Failed:", ocrErr);
            ocrText = "[OCR Failed to Process Image]";
        } finally {
             // Cleanup temp file
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }
    }

    // Step 2: AI Summary
    const aiSummary = generateMockSummary(
        { age, gender, complaint, duration, history, language }, 
        ocrText
    );

    const newCase = {
      case_id: crypto.randomUUID(),
      patient_inputs: { age, gender, complaint, duration, history, language },
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
  console.log(`Server running on http://localhost:${PORT}`);
});
