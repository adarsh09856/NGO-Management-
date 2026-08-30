import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Eye, Search, FileText, Image as ImageIcon, Save, X, Calendar, User, CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function BlogManager() {
  const { success, error } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [authorName, setAuthorName] = useState('Khenpo Tashi Dorji');
  const [status, setStatus] = useState('published');
  const [tags, setTags] = useState('Peace Stupa, Buddhism, Bhutan');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  async function loadBlogPosts() {
    try {
      setLoading(true);
      const res = await api.get('/blog?all=true&limit=100');
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setSummary('');
    setContent('');
    setCoverImage('https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800');
    setAuthorName('Khenpo Tashi Dorji');
    setStatus('published');
    setTags('Peace Stupa, Buddhism, Bhutan');
    setModalOpen(true);
  };

  const handleOpenEdit = async (p) => {
    try {
      const res = await api.get(`/blog/${p.slug}`);
      if (res.data.success) {
        const fullPost = res.data.data;
        setEditingPost(fullPost);
        setTitle(fullPost.title);
        setSlug(fullPost.slug);
        setSummary(fullPost.summary || '');
        setContent(fullPost.content || '');
        setCoverImage(fullPost.cover_image || '');
        setAuthorName(fullPost.author_name || 'Khenpo Tashi Dorji');
        setStatus(fullPost.status || 'published');
        setTags(fullPost.tags || '');
        setModalOpen(true);
      }
    } catch (err) {
      error('Failed to load full post content');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setCoverImage(res.data.url);
        success('Cover image uploaded successfully');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      error('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title,
        slug,
        summary,
        content,
        cover_image: coverImage,
        author_name: authorName,
        status,
        tags
      };

      if (editingPost) {
        const res = await api.put(`/blog/${editingPost.id}`, payload);
        if (res.data.success) {
          success('Blog article updated successfully');
          setModalOpen(false);
          loadBlogPosts();
        }
      } else {
        const res = await api.post('/blog', payload);
        if (res.data.success) {
          success('Blog article published successfully');
          setModalOpen(false);
          loadBlogPosts();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await api.delete(`/blog/${id}`);
      if (res.data.success) {
        success('Blog post deleted successfully');
        loadBlogPosts();
      }
    } catch (err) {
      error('Failed to delete blog post');
    }
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tags && p.tags.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Blog & Articles Manager
          </h1>
          <p className="text-xs text-gray-500">
            Publish and manage monastery news, spiritual insights, and updates for the public website.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#EBE5D8] flex items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search articles by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7E1929]"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
          Total: {filteredPosts.length} posts
        </span>
      </div>

      {/* Posts Table */}
      <div className="monastery-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF5F0] border-b border-[#EBE5D8] text-[#4A0E17] font-bold">
                <th className="p-3.5">Cover</th>
                <th className="p-3.5">Article Title</th>
                <th className="p-3.5">Author</th>
                <th className="p-3.5">Tags</th>
                <th className="p-3.5">Published Date</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Loading blog posts...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No articles found. Click "New Article" to create one.
                  </td>
                </tr>
              ) : filteredPosts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={p.cover_image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=100'}
                      alt={p.title}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=100'; }}
                      className="w-12 h-10 object-cover rounded shadow-sm"
                    />
                  </td>
                  <td className="p-3 font-semibold text-[#4A0E17] max-w-xs">
                    <p className="line-clamp-1">{p.title}</p>
                    <p className="text-[10px] text-gray-400 font-normal line-clamp-1">{p.summary}</p>
                  </td>
                  <td className="p-3 text-gray-700">{p.author_name}</td>
                  <td className="p-3 text-gray-500 max-w-[150px] truncate">{p.tags}</td>
                  <td className="p-3 text-gray-600">{new Date(p.published_at).toLocaleDateString()}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.status || 'published'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <a
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-gray-500 hover:text-[#4A0E17]"
                        title="View Public Post"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit Post"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D4AF37]/40 animate-fadeIn">
            <div className="p-5 bg-[#FAF5F0] border-b border-[#EBE5D8] flex items-center justify-between">
              <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
                {editingPost ? 'Edit Blog Article' : 'Create New Blog Article'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Spiritual Significance of the Great Druk Wangyel Stupa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Short Summary / Excerpt</label>
                <textarea
                  rows={2}
                  placeholder="Brief 1-2 sentence overview of the article..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                />
              </div>

              {/* Cover Image Upload or URL */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Cover Image (URL or Upload File)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none font-mono text-[11px]"
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded cursor-pointer font-bold text-gray-700 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                {coverImage && (
                  <img src={coverImage} alt="Cover preview" className="h-28 w-full object-cover rounded border border-gray-200" />
                )}
              </div>

              {/* Author & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Peace Stupa, Buddhism, Bhutan"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                  />
                </div>
              </div>

              {/* Rich Content Body (HTML / Markdown) */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Article Content (HTML supported) *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Write the full article content here with paragraphs <p>...</p> and headings <h3>...</h3>"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Publish Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                >
                  <option value="published">Published (Visible to Public)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : editingPost ? 'Update Article' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
