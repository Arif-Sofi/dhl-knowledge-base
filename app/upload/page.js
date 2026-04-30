'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileType2 } from 'lucide-react';

export default function UploadConsole() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Handle the file upload and text extraction
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsExtracting(true);
    
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
        alert(data.error);
      }
    } catch (error) {
      alert('Error extracting file text.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        content, 
        tags, 
        creator_email: 'editor@dhl.com' 
      })
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl border-t-4 border-red-600">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Knowledge Base Source</h2>
        
        {/* File Upload Area */}
        <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center hover:bg-gray-100 transition">
          <UploadCloud className="mx-auto text-gray-400 mb-2" size={40} />
          <p className="text-sm text-gray-600 mb-4">
            Upload a messy source file to auto-extract text. <br/>
            <span className="font-bold">Supports: .txt, .pdf, .docx, .msg</span>
          </p>
          <input 
            type="file" 
            accept=".txt,.pdf,.docx,.msg" 
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
          />
          {isExtracting && <p className="text-red-600 font-bold mt-3 animate-pulse">Extracting text, please wait...</p>}
        </div>

        {/* Manual Edit Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-bold text-gray-700">Draft Title</label>
            <input 
              type="text" placeholder="e.g., Damaged Parcel Instructions" required
              className="border p-2 rounded w-full mt-1 text-gray-500" value={title} onChange={e => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-bold text-gray-700">Extracted Content (Edit if necessary)</label>
            <textarea 
              placeholder="Content will appear here after extraction, or paste manually..." required rows="10"
              className="border p-2 rounded w-full mt-1 font-mono text-sm text-gray-500" value={content} onChange={e => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Tags (comma separated)</label>
            <input 
              type="text" placeholder="e.g., damaged, warehouse, SOP" required
              className="border p-2 rounded w-full mt-1 text-gray-500" value={tags} onChange={e => setTags(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => router.push('/')} className="px-4 py-2 text-gray-600">Cancel</button>
            <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700">Save as Draft</button>
          </div>
        </form>
      </div>
    </div>
  );
}