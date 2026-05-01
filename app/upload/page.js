'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';

export default function UploadConsole() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle the file upload and text extraction
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsExtracting(true);
    setErrorMessage('');
    
    // Create FormData to send the file to our API
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Auto-fill the form with the extracted data
        setContent(data.text);
        if (!title) setTitle(data.suggestedTitle); // Only set title if it's currently empty
      } else {
        setErrorMessage(data.error || 'Extraction failed.');
      }
    } catch (error) {
      setErrorMessage('Error extracting file text.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          content, 
          tags, 
          creator_email: 'editor@dhl.com' 
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to save draft');
      }
      
      router.push('/');
    } catch (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl border-t-4 border-red-600">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Knowledge Base Source</h2>
        
        {errorMessage && (
          <div id="error-message" className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
        
        {/* File Upload Area */}
        <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center hover:bg-gray-100 transition">
          <UploadCloud className="mx-auto text-gray-400 mb-2" size={40} />
          <p className="text-sm text-gray-600 mb-4">
            Upload a messy source file to auto-extract text. <br/>
            <span className="font-bold">Supports: .txt, .pdf, .docx, .msg, Images (PNG/JPG)</span>
          </p>
          <input 
            id="file-upload"
            type="file" 
            accept=".txt,.pdf,.docx,.msg,image/*" 
            onChange={handleFileUpload}
            disabled={isExtracting || isSaving}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer disabled:opacity-50"
          />
          {isExtracting && <p id="extraction-loading" className="text-red-600 font-bold mt-3 animate-pulse">Extracting text, please wait...</p>}
        </div>

        {/* Manual Edit Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="article-title" className="text-sm font-bold text-gray-700">Draft Title</label>
            <input 
              id="article-title"
              type="text" placeholder="e.g., Damaged Parcel Instructions" required
              className="border p-2 rounded w-full mt-1 text-gray-500 disabled:opacity-50" 
              value={title} onChange={e => setTitle(e.target.value)}
              disabled={isSaving}
            />
          </div>
          
          <div>
            <label htmlFor="article-content" className="text-sm font-bold text-gray-700">Extracted Content (Edit if necessary)</label>
            <textarea 
              id="article-content"
              placeholder="Content will appear here after extraction, or paste manually..." required rows="10"
              className="border p-2 rounded w-full mt-1 font-mono text-sm text-gray-500 disabled:opacity-50" 
              value={content} onChange={e => setContent(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="article-tags" className="text-sm font-bold text-gray-700">Tags (comma separated)</label>
            <input 
              id="article-tags"
              type="text" placeholder="e.g., damaged, warehouse, SOP" required
              className="border p-2 rounded w-full mt-1 text-gray-500 disabled:opacity-50" 
              value={tags} onChange={e => setTags(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button id="cancel-btn" type="button" onClick={() => router.push('/')} disabled={isSaving} className="px-4 py-2 text-gray-600 disabled:opacity-50">Cancel</button>
            <button id="save-draft-btn" type="submit" disabled={isSaving || isExtracting} className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}