# DHL Knowledge Base

A modern Next.js application designed to manage and automate the creation of knowledge base articles. It features a powerful extraction engine that can pull text from various file formats, making it easy to digitize messy source documents.

## Features

- **Automated Text Extraction:** Supports `.txt`, `.pdf`, `.docx`, and `.msg` (Outlook) files.
- **OCR Support:** Uses Tesseract.js to extract text from images (`.png`, `.jpg`, `.jpeg`).
- **Draft Management:** Create, edit, and save knowledge base articles with tags.
- **Supabase Integration:** Securely store articles and metadata in a Supabase database.
- **Responsive UI:** Built with Tailwind CSS for a clean, professional look.

## Prerequisites

- **Node.js:** Version `20.16.0` or higher (Required for `pdf-parse` compatibility).
- **Supabase Account:** A Supabase project with a table for articles.

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ArifSofi/dhl-knowledge-base.git
   cd dhl-knowledge-base
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## File Extraction Support

The application uses an API route at `/api/extract` to handle file uploads:
- **PDFs:** Handled via `pdf-parse` (Class-based API).
- **DOCX:** Handled via `mammoth`.
- **MSG:** Handled via `@kenjiuno/msgreader`.
- **Images:** Handled via `Tesseract.js`.

