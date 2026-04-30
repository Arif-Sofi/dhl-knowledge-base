import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
// import pdfParse from 'pdf-parse';
import MsgReader from '@kenjiuno/msgreader';

export async function POST(req) {
  try {
    // 1. Get the file from the request
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 2. Convert file to a Buffer (required by parsing libraries)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name.toLowerCase();
    
    let extractedText = '';

    // 3. Extract text based on file type
    if (fileName.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8');
      
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
      
    } else if (fileName.endsWith('.pdf')) {
      const result = await pdfParse(buffer);
      extractedText = result.text;
      
    } else if (fileName.endsWith('.msg')) {
      const msgReader = new MsgReader(buffer);
      const msgData = msgReader.getFileData();
      // Try to get the plain text body, fallback to RTF if plain text is missing
      extractedText = msgData.body || "Could not extract text. Email might be image-only.";
      
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload txt, pdf, docx, or msg.' }, { status: 400 });
    }

    // 4. Return the extracted text and a suggested title
    return NextResponse.json({ 
      success: true,
      text: extractedText.trim(), 
      suggestedTitle: file.name.split('.')[0] // Uses filename without extension as title
    });

  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: 'Failed to process file.' }, { status: 500 });
  }
}