

---

# **PART 1 — PRD (PRODUCT REQUIREMENTS DOCUMENT)**

## **1.1 Product Name**

**Nivaaran**

## **1.2 Problem Statement**

Doctors in India spend a large portion of consultation time collecting basic patient information, reducing the time available for actual medical decision-making—especially in high-volume OPDs.

## **1.3 Target Users**

* **Primary:** Doctors (General OPD)  
* **Secondary:** Patients (especially vernacular-first users)  
* **Buyer (future):** Hospitals & clinics

## **1.4 Core Use Case (ONLY ONE)**

A patient provides medical history before consultation → AI generates a structured summary → doctor reviews it before seeing the patient.

## **1.5 Non-Goals (Explicit)**

* Diagnosis  
* Treatment suggestions  
* Appointment booking  
* Full EHR  
* Voice calling

This keeps you safe and focused.

---

## **1.6 MVP Features**

### **Patient Side**

* Language selection (1 language)  
* Structured intake form/chat  
* Upload previous prescription/report (image)  
* Submit case

### **AI Layer**

* OCR to extract text  
* LLM to generate doctor-ready summary

### **Doctor Side**

* List of submitted cases  
* View patient summary  
* Text box to type prescription/notes (manual)

---

## **1.7 Success Metric (for judges)**

* “Doctor gets usable summary **before** consultation”  
* Demo completes without failure

---

# **PART 2 — PROJECT ARCHITECTURE (KEEP THIS SIMPLE)**

## **2.1 High-Level Architecture**

\[ Patient View \]  
      ↓  
\[ Backend API \]  
      ↓  
\[ OCR \] → \[ OpenAI \]  
      ↓  
\[ Case Store (In-Memory / JSON) \]  
      ↓  
\[ Doctor View \]

No queues.  
No real-time sync.  
No databases required.

---

## **2.2 Single Source of Truth: PatientCase**

Every flow revolves around **one object**.

{  
  "case\_id": "uuid",  
  "language": "Hindi",  
  "patient\_inputs": {  
    "age": "",  
    "gender": "",  
    "complaint": "",  
    "duration": "",  
    "history": ""  
  },  
  "ocr\_text": "",  
  "ai\_summary": "",  
  "doctor\_notes": "",  
  "status": "ready"  
}

Both Patient View and Doctor View **read/write this object**.

---

# **PART 3 — TECH STACK (RECOMMENDED FOR SOLO BUILDER)**

## **Frontend**

* Next.js   
* Two routes:  
  * `/patient`  
  * `/doctor`

## **Backend**

* Node.js (Express)   
* In-memory store (array / dict)

## **AI**

* **OpenAI API** (primary)  
* **FastRouter.ai** (backup)

## **OCR**

* Tesseract 

---

# **PART 4 — BACKEND API CONTRACT (MINIMAL)**

## **POST `/create-case`**

Creates a patient case \+ AI summary.

**Request**

{  
  "age": "45",  
  "gender": "Male",  
  "complaint": "Fever and cough",  
  "duration": "3 days",  
  "history": "Diabetes",  
  "ocr\_text": "Paracetamol 500mg"  
}

**Response**

{  
  "case\_id": "abc123",  
  "status": "ready"  
}

---

## **GET `/cases`**

Returns all cases for doctor.

\[  
  {  
    "case\_id": "abc123",  
    "ai\_summary": "...",  
    "doctor\_notes": ""  
  }  
\]

---

## **POST `/doctor-notes`**

{  
  "case\_id": "abc123",  
  "doctor\_notes": "Paracetamol twice daily"  
}

---

# **PART 5 — HOW YOU SHOULD START (ORDER MATTERS)**

### **STEP 1 (FIRST 30 MIN)**

* Create backend  
* Test OpenAI API with dummy input

### **STEP 2**

* Create Patient View (form)  
* Collect inputs  
* Submit to backend

### **STEP 3**

* Generate AI summary  
* Console.log it first

### **STEP 4**

* Render summary in Doctor View

### **STEP 5**

* Add doctor notes input  
* Polish UI

