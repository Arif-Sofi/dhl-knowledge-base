---
marp: true
theme: default
paginate: true
header: "SECJ 3483 – Web Technology | Individual Assignment"
footer: "AI-Powered Knowledge Base Automation for DHL"
style: |
  section {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  h1 {
    color: #d40511; /* DHL Red */
  }
  h2 {
    color: #333;
  }
  .cite {
    font-size: 0.8em;
    color: #666;
  }
---

# AI-Powered Knowledge Base Automation
## DHL Logistics Operations (DAC 3.0 Challenge)

**Presented by:** [Your Name]
**Matric No:** [Your Matric Number]
**Project:** Individual Assignment (20%)
**Course:** SECJ 3483 – Web Technology

---

# 1. Introduction
## Industry Collaboration & DAC 3.0

- **Partner:** DHL Global Finance Services – Asia Pacific.
- **Context:** Real-world logistics problems inspired by actual industry practices.
- **Challenge:** Transforming unstructured, scattered data into standardized Knowledge Base (KB) articles.
- **Scope:** 60% Web Application | 40% RPA Design.

---

# 2. Logistics Scenario
## Scenario 1: AI-Powered Knowledge Base Automation

- **The Problem:** DHL teams receive thousands of messages/documents daily.
- **Sources:** MS Teams/Telegram, Email threads, Screenshots, Handwritten notes.
- **Pain Point:** Creating clean SOPs (Standard Operating Procedures) is slow, inconsistent, and manually intensive.
- **Objective:** Automate the entire transformation process—from raw messy input to clean knowledge articles.

---

# 3. The Solution: Technical Architecture
## Modern Web Stack & Extraction Engine

- **Frontend:** Next.js (React) + Tailwind CSS for a modern, responsive UI.
- **Backend:** Supabase (PostgreSQL) for secure, real-time database management.
- **Extraction API (`/api/extract`):**
  - **Text:** `.txt`, `.pdf`, `.docx`.
  - **Emails:** `.msg` (Outlook) parser.
  - **AI/OCR:** Tesseract.js for images (PNG/JPG) and handwritten notes.

---

# 4. Web Application Features
## The Management Console

- **Upload Console:** Multi-format file ingestion with auto-extraction.
- **Draft Builder:** Real-time editing of extracted content with tagging.
- **Viewer Page:** Searchable/filterable grid (by tag, date, creator, status).
- **Status Lifecycle:** 
  - `Draft` (Pending Review)
  - `Reviewed` (Validated)
  - `Published` (Live in KB)

---

# 5. Extraction & OCR Logic
## Digitizing Messy Data

- **Multi-Parser Integration:** Uses `mammoth` (Word), `pdf-parse`, and `msgreader`.
- **OCR Support:** Tesseract.js identifies text from screenshots and photos.
- **Smart Suggestions:** The system automatically suggests article titles based on file names.
- **API Bridge:** A specialized bridge for RPA to submit Base64 encoded files directly.

---

# 6. UiPath Path (The RPA Workflow)
## Step-by-Step Automation Flow

1.  **Initialization:** Bot reads `processed_history.txt` to load previously handled file hashes.
2.  **Ingestion:** Scans the source folder: `G:\My Drive\DHL_Inputs`.
3.  **Duplicate Check:** If the file exists in `Processed_Hashes`, increment `Duplicate_Count` and skip.
4.  **Extraction (HTTP):** Sends file to `/api/extract` and deserializes the JSON response.
5.  **Creation (HTTP):** Sends the extracted text to `/api/articles` to create a new Knowledge Base draft.
6.  **Reporting:** Appends the file to the history log and sends a summary via **Outlook Desktop Mail**.

---

# 7. RPA Integration & Logic
## Technical Implementation Details

- **Core Variables:**
  - `Folder_Path`: G:\My Drive\DHL_Inputs
  - `Processed_Hashes`: History log for deduplication.
  - `Success_Count` / `Duplicate_Count`: Real-time execution stats.
- **Error Handling:** Wrapped in a **Try Catch** block to manage API timeouts or file reading errors.
- **Reporting Logic:** Sends a Daily Summary to `muhammadarifhakimi@live.utm.my` with bot execution status and final counts.
- **The Bridge:** Uses UiPath's **HTTP Request (Legacy)** activities to communicate with the Next.js API.

---

# 8. Benefits to DHL
## Operational Impact

- **Efficiency:** Drastically reduces the time spent on manual data entry.
- **Quality:** Standardizes the structure and tone of Knowledge Base articles.
- **Accessibility:** Centralizes knowledge from fragmented chat/email sources into one searchable portal.
- **Scalability:** The RPA bot can handle thousands of files without fatigue.

---

# 9. Conclusion
## Delivering the Future of Logistics

- **Successful Integration:** Web Technologies + RPA + AI (OCR).
- **Outcome:** A robust, enterprise-ready tool for DHL Global Finance.
- **Future Ready:** Architecture is prepared for LLM (GPT) integration for automated summarization and polishing.

---

# Thank You!
## Questions & Demo

- **Project Source:** Next.js + Supabase + Tesseract.js
- **RPA Tool:** UiPath Studio
- **Developer:** [Your Name]
