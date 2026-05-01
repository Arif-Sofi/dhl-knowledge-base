'use client';
import { useState, useEffect } from 'react';
import { Search, FileText, Upload } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search and Filter Logic
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase()) || 
                          (article.tags && article.tags.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">DHL Knowledge Base</h1>
          <Link href="/upload" id="upload-btn" className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700">
            <Upload size={20} /> Upload / New Draft
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              id="search-input"
              type="text" 
              placeholder="Search by title or tags..." 
              className="w-full pl-10 pr-4 py-2 text-gray-400 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            id="status-filter"
            className="border rounded-lg px-4 py-2 text-gray-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Published">Published</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div id="loading-spinner" className="text-center py-12 text-gray-500 font-bold">
            Loading articles...
          </div>
        ) : (
          /* Article Grid */
          <div id="article-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredArticles.length === 0 ? (
              <div id="no-articles-message" className="col-span-3 text-center py-12 text-gray-500">
                No articles found matching your criteria.
              </div>
            ) : (
              filteredArticles.map(article => (
                <Link href={`/article/${article.id}`} key={article.id} id={`article-card-${article.id}`}>
                  <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border-t-4 border-red-600 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <FileText className="text-gray-500" />
                      <span className={`px-2 py-1 text-xs rounded-full font-bold
                        ${article.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 
                          article.status === 'Reviewed' ? 'bg-blue-100 text-blue-700' : 
                          'bg-green-100 text-green-700'}`}>
                        {article.status}
                      </span>
                    </div>
                    <h3 className="text-lg text-gray-900 font-bold mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{article.content}</p>
                    <div className="text-xs text-gray-400 mt-auto">Tags: {article.tags || 'None'}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}