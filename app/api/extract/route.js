import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import MsgReader from '@kenjiuno/msgreader';
import Tesseract from 'tesseract.js';
import { PDFParse } from 'pdf-parse';

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let buffer;
    let fileName = '';

    // 1. Handle UiPath RPA (JSON / Base64 Data)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      if (!body.filedata) return NextResponse.json({ error: 'No filedata provided' }, { status: 400 });
      
      buffer = Buffer.from(body.filedata, 'base64');
      fileName = body.filename.toLowerCase();
    } 
    // 2. Handle Human Web Uploads (Multipart Form Data)
    else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      let file = null;
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'object' && value.name) {
          file = value;
          break;
        }
      }
      if (!file) return NextResponse.json({ error: 'No file found' }, { status: 400 });
      
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      fileName = file.name.toLowerCase();
    } 
    else {
      return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
    }

    // 3. Extract the Text
    let extractedText = '';
    if (fileName.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8');
    } 
    else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } 
    else if (fileName.endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      extractedText = result.text;
    } 
    else if (fileName.endsWith('.msg')) {
      const msgReader = new MsgReader(buffer);
      const msgData = msgReader.getFileData();
      extractedText = msgData.body || "Could not extract text. Email might be image-only.";
    } 
    else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png')) {
      const result = await Tesseract.recognize(buffer, 'eng');
      extractedText = result.data.text;
    } 
    else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      text: extractedText.trim(), 
      suggestedTitle: fileName.split('.')[0] 
    });

  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: error.message || 'Failed to process file.' }, { status: 500 });
  }
}