Nivaaran
A. Problem Statement :
India has too few doctors, and doctors spend a large part of each consultation collecting basic patient information.
This reduces time for diagnosis and care, especially in high-volume clinics.

B. Users & Context :
Primary users- Doctors and clinic staff
Secondary users - Patients (especially first-time or repeat visitors)
Context - Busy OPDs, clinics, and hospitals where doctors see many patients daily

C. Solution Overview :
Nivaaran is a pre-consultation assistant that collects patient symptoms and past prescriptions before the doctor visit and generates a doctor-ready summary.

D. Flow :
Patient → fills details & uploads prescription →
Nivaaran extracts key information →
Doctor sees a clean summary before consultation

E. Setup & Run (Local) :
1. Clone the repository
2. Install dependencies
npm install
3. Start backend
cd server && npm start
4. Start frontend
npm run dev
5. Open:
/patient for patient intake
/doctor for doctor dashboard

F. Models & Data :
1. AI approach - Deterministic, rule-based clinical information extraction (MVP)
2. Data sources- 
- Patient-entered data
- OCR-extracted text from uploaded medical documents
3. Licenses:
User-provided data only (no third-party datasets used)

G. Evaluation & Guardrails :
1. No diagnosis or treatment recommendations
2. No hallucination: system only extracts information present in inputs
3. Clear labeling: “AI-Assisted – Rule-Based MVP”
4. Original documents always available for doctor verification

H. Known Limitations & Risks :
1. Rule-based extraction may miss uncommon medicine formats
2. Handwritten prescriptions may reduce OCR accuracy
3. Not a medical decision system (summary only)

I. Solo Team :
Nishant Pabale – Product, UI/UX, AI logic, frontend & backend
📧 Contact: (pabalenishant4@gmail.com / @pabalenishant1 / linkedin.com/in/pabalenishant/)