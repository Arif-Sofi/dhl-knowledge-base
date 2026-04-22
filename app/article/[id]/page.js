'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ArticleDetail({ params }) {
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    fetchArticleDetails();
  }, []);

  const fetchArticleDetails = async () => {
    // Fetch article
    const res = await fetch(`/api/articles`);
    const data = await res.json();
    const current = data.find(a => a.id === params.id);
    setArticle(current);

    // Fetch version history directly from Supabase for speed
    const { data: history } = await supabase
      .from('article_versions')
      .select('*')
      .eq('article_id', params.id)
      .order('changed_at', { ascending: false });
    setVersions(history || []);
  };

  const updateStatus = async (newStatus) => {
    await fetch(`/api/articles/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        old_status: article.status,
        changed_by: 'supervisor@dhl.com' // Mock user
      })
    });
    fetchArticleDetails(); // Reload data
  };

  const deleteArticle = async () => {
    await fetch(`/api/articles/${article.id}`, { method: 'DELETE' });
    router.push('/');
  };

  if (!article) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-red-600 mb-6">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-red-600 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{article.title}</h1>
            <span className="px-4 py-2 rounded-full text-sm font-bold bg-gray-100 border text-gray-700">
              Current Status: {article.status}
            </span>
          </div>
          
          <div className="bg-gray-50 p-4 rounded border mb-6 whitespace-pre-wrap">
            {article.content}
          </div>
          
          <div className="flex justify-between items-center border-t pt-4">
            <div>
              <p className="text-sm text-gray-500">Tags: {article.tags}</p>
              <p className="text-sm text-gray-500">Creator: {article.creator_email}</p>
            </div>
            
            {/* Workflow Buttons */}
            <div className="flex gap-2">
              {article.status === 'Draft' && (
                <button onClick={() => updateStatus('Reviewed')} className="bg-blue-500 text-white px-4 py-2 rounded">Mark as Reviewed</button>
              )}
              {article.status === 'Reviewed' && (
                <button onClick={() => updateStatus('Published')} className="bg-green-500 text-white px-4 py-2 rounded">Publish to KB</button>
              )}
              <button onClick={deleteArticle} className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200">Delete</button>
            </div>
          </div>
        </div>

        {/* Version History Table */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Workflow & Version History</h3>
          {versions.length === 0 ? <p className="text-gray-500">No status changes yet.</p> : (
            <ul className="space-y-3">
              {versions.map(v => (
                <li key={v.id} className="text-sm bg-gray-50 p-3 rounded border">
                  Status changed from <span className="font-bold text-gray-500">{v.old_status}</span> to <span className="font-bold text-gray-800">{v.new_status}</span> 
                  <br/><span className="text-gray-400 text-xs">By {v.changed_by} on {new Date(v.changed_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}