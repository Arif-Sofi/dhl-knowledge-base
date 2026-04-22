'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ArticleDetail({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [versions, setVersions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticleDetails();
  }, [id]);

  const fetchArticleDetails = async () => {
    try {
      // Fetch specific article
      const res = await fetch(`/api/articles/${id}`);
      if (!res.ok) throw new Error('Article not found');
      const data = await res.json();
      setArticle(data);

      // Fetch version history directly from Supabase
      const { data: history, error: historyError } = await supabase
        .from('article_versions')
        .select('*')
        .eq('article_id', id)
        .order('changed_at', { ascending: false });
      
      if (historyError) console.error('History fetch error:', historyError);
      setVersions(history || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          old_status: article.status,
          changed_by: 'supervisor@dhl.com' // Mock user
        })
      });
      if (res.ok) {
        fetchArticleDetails(); // Reload data
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const deleteArticle = async () => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/');
      }
    } catch (err) {
      console.error('Delete article error:', err);
    }
  };

  if (error) return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
      <p className="text-gray-600 mb-6">{error}</p>
      <Link href="/" className="text-blue-500 underline">Back to Dashboard</Link>
    </div>
  );

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
                <button onClick={() => updateStatus('Reviewed')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Mark as Reviewed</button>
              )}
              {article.status === 'Reviewed' && (
                <button onClick={() => updateStatus('Published')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">Publish to KB</button>
              )}
              <button onClick={deleteArticle} className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition">Delete</button>
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