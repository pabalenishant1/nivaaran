# 🩺 Nivaaran

## Problem Statement
India has too few doctors, and doctors spend a large part of each consultation collecting basic patient information.  
This reduces time for diagnosis and care, especially in high-volume clinics and OPDs.

---

## Users & Context

**Primary Users**
- Doctors  
- Clinic and hospital staff  

**Secondary Users**
- Patients (first-time and repeat visitors)

**Context**
- Busy OPDs, clinics, and hospitals where doctors see many patients every day

---

## Solution Overview

Nivaaran is a **pre-consultation assistant** that collects patient symptoms and past prescriptions before the doctor visit and generates a **doctor-ready summary**.

**Workflow**
Patient enters details & uploads prescription
↓
Nivaaran extracts key medical information
↓
Doctor reviews a clean summary before consultation

---

## Setup & Run (Local)

### 1. Clone the repository
```bash
git clone https://github.com/pabalenishant1/nivaaran.git
cd nivaaran
2. Install dependencies
npm install

3. Start the backend
cd server
npm start

4. Start the frontend
npm run dev

5. Open in browser

/patient → Patient intake interface

/doctor → Doctor dashboard

Models & Data

AI Approach

Deterministic, rule-based clinical information extraction (MVP)

Data Sources

Patient-entered form data

OCR-extracted text from uploaded medical documents

Licensing

Only user-provided data is used

No third-party medical datasets involved

Evaluation & Guardrails

No diagnosis or treatment recommendations

No hallucination: only extracts information present in inputs

Clear labeling: “AI-Assisted – Rule-Based MVP”

Original uploaded documents are always available for doctor verification

Known Limitations & Risks

Rule-based extraction may miss uncommon medicine formats

Handwritten prescriptions can reduce OCR accuracy

Not a medical decision system (summary assistance only)

Team

Nishant
Product · UX · AI Logic · Frontend & Backend
📧 Contact: (pabalenishant4@gmail.com / linkedin.com/in/pabalenishant )
