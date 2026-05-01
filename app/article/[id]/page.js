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
  
  // UI State for RPA
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    setIsUpdating(true);
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
        await fetchArticleDetails(); // Reload data
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Update status error:', err);
      setError('Failed to update article status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/');
      } else {
        throw new Error('Failed to delete article');
      }
    } catch (err) {
      console.error('Delete article error:', err);
      setError('Failed to delete article.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (error) return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
      <p id="error-message" className="text-gray-600 mb-6">{error}</p>
      <Link href="/" id="back-link" className="text-blue-500 underline">Back to Dashboard</Link>
    </div>
  );

  if (!article) return <div id="loading-spinner" className="p-8 text-center font-bold text-gray-500">Loading article details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      
      {/* In-DOM Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this article? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                id="cancel-delete-btn"
                onClick={() => setShowDeleteConfirm(false)} 
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                id="confirm-delete-btn"
                onClick={confirmDelete} 
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <Link href="/" id="back-link" className="flex items-center gap-2 text-gray-500 hover:text-red-600 mb-6 w-fit">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-red-600 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 id="article-title-display" className="text-3xl font-bold text-gray-900">{article.title}</h1>
            <span id="article-status-display" className="px-4 py-2 rounded-full text-sm font-bold bg-gray-100 border text-gray-700">
              Current Status: {article.status}
            </span>
          </div>
          
          <div id="article-content-display" className="bg-gray-50 p-4 rounded border mb-6 whitespace-pre-wrap text-blue-500">
            {article.content}
          </div>
          
          <div className="flex justify-between items-center border-t pt-4">
            <div>
              <p id="article-tags-display" className="text-sm text-gray-500">Tags: {article.tags}</p>
              <p id="article-creator-display" className="text-sm text-gray-500">Creator: {article.creator_email}</p>
            </div>
            
            {/* Workflow Buttons */}
            <div className="flex gap-2">
              {article.status === 'Draft' && (
                <button 
                  id="mark-reviewed-btn"
                  onClick={() => updateStatus('Reviewed')} 
                  disabled={isUpdating}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Mark as Reviewed'}
                </button>
              )}
              {article.status === 'Reviewed' && (
                <button 
                  id="publish-btn"
                  onClick={() => updateStatus('Published')} 
                  disabled={isUpdating}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Publish to KB'}
                </button>
              )}
              <button 
                id="initiate-delete-btn"
                onClick={() => setShowDeleteConfirm(true)} 
                disabled={isUpdating || isDeleting}
                className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Version History Table */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-600">Workflow & Version History</h3>
          {versions.length === 0 ? <p id="no-versions-message" className="text-gray-500">No status changes yet.</p> : (
            <ul id="version-history-list" className="space-y-3">
              {versions.map(v => (
                <li key={v.id} className="text-sm bg-gray-50 p-3 rounded border text-gray-400">
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