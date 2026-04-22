'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadConsole() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        content, 
        tags, 
        creator_email: 'editor@dhl.com' // Mock user for now
      })
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl border-t-4 border-red-600">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload New Information</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" placeholder="Title (e.g., Damaged Parcel Instructions)" required
            className="border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)}
          />
          <textarea 
            placeholder="Paste raw text from MS Teams or email here..." required rows="6"
            className="border p-2 rounded" value={content} onChange={e => setContent(e.target.value)}
          />
          <input 
            type="text" placeholder="Tags (e.g., damaged, warehouse, SOP)" required
            className="border p-2 rounded" value={tags} onChange={e => setTags(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => router.push('/')} className="px-4 py-2 text-gray-600">Cancel</button>
            <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700">Save as Draft</button>
          </div>
        </form>
      </div>
    </div>
  );
}