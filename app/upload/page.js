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
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl border-t-8 border-dhl-red">
        <div className="flex items-center gap-4 mb-8 bg-dhl-yellow -mx-8 -mt-8 p-6 rounded-t-lg border-b-4 border-dhl-red">
          <div className="bg-dhl-red p-2 rounded-lg">
            <UploadCloud className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black text-dhl-red italic tracking-tighter uppercase">Upload <span className="text-black font-bold not-italic">Knowledge Source</span></h2>
        </div>
        
        {errorMessage && (
          <div id="error-message" className="mb-6 p-4 bg-red-50 border-l-4 border-dhl-red text-red-700 rounded shadow-sm">
            <p className="font-bold">Error Processing Request</p>
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
        
        {/* File Upload Area */}
        <div className="mb-8 p-8 border-4 border-dashed border-gray-100 rounded-xl bg-gray-50 text-center hover:bg-gray-100 transition-all group">
          <UploadCloud className="mx-auto text-gray-300 group-hover:text-dhl-red transition-colors mb-4" size={48} />
          <p className="text-base text-gray-700 mb-6">
            Drag and drop a messy source file to <span className="text-dhl-red font-bold">auto-extract</span> text. <br/>
            <span className="text-xs text-gray-400 mt-2 block italic">Supports: .txt, .pdf, .docx, .msg, Images (PNG/JPG)</span>
          </p>
          <input 
            id="file-upload"
            type="file" 
            accept=".txt,.pdf,.docx,.msg,image/*" 
            onChange={handleFileUpload}
            disabled={isExtracting || isSaving}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-dhl-red file:text-white hover:file:bg-red-700 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
          />
          {isExtracting && (
            <div id="extraction-loading" className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-dhl-red rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-dhl-red rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-dhl-red rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <p className="text-dhl-red font-black uppercase text-sm tracking-widest ml-2">Extracting Intelligence...</p>
            </div>
          )}
        </div>

        {/* Manual Edit Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label htmlFor="article-title" className="text-xs font-black text-gray-500 uppercase tracking-widest">Draft Title</label>
            <input 
              id="article-title"
              type="text" placeholder="e.g., Damaged Parcel Instructions" required
              className="border-2 border-gray-100 p-3 rounded-lg w-full text-gray-900 focus:outline-none focus:border-dhl-red transition-colors" 
              value={title} onChange={e => setTitle(e.target.value)}
              disabled={isSaving}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="article-content" className="text-xs font-black text-gray-500 uppercase tracking-widest">Extracted Content</label>
            <textarea 
              id="article-content"
              placeholder="Content will appear here after extraction..." required rows="8"
              className="border-2 border-gray-100 p-4 rounded-lg w-full font-mono text-sm text-gray-800 focus:outline-none focus:border-dhl-red transition-colors" 
              value={content} onChange={e => setContent(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="article-tags" className="text-xs font-black text-gray-500 uppercase tracking-widest">Tags (comma separated)</label>
            <input 
              id="article-tags"
              type="text" placeholder="e.g., damaged, warehouse, SOP" required
              className="border-2 border-gray-100 p-3 rounded-lg w-full text-gray-900 focus:outline-none focus:border-dhl-red transition-colors" 
              value={tags} onChange={e => setTags(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-gray-100">
            <button id="cancel-btn" type="button" onClick={() => router.push('/')} disabled={isSaving} className="px-6 py-2 text-gray-500 font-bold hover:text-gray-700 disabled:opacity-50 transition-colors uppercase text-sm">Cancel</button>
            <button id="save-draft-btn" type="submit" disabled={isSaving || isExtracting} className="bg-dhl-red text-white px-8 py-3 rounded-full font-black uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl active:scale-95">
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}