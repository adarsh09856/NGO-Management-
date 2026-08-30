import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Image as ImageIcon, Video, Film, Play,
  Search, Save, X, UploadCloud, Link as LinkIcon, Eye
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function GalleryManager() {
  const { success, error } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Stupa Construction');
  const [mediaType, setMediaType] = useState('image'); // 'image', 'video_upload', 'video_url'
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isFeatured, setIsFeatured] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    try {
      setLoading(true);
      const res = await api.get('/cms/gallery');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load gallery items:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('Stupa Construction');
    setMediaType('image');
    setMediaUrl('');
    setThumbnailUrl('');
    setCaption('');
    setDisplayOrder(0);
    setIsFeatured(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category || 'Stupa Construction');
    setMediaType(item.media_type || 'image');
    setMediaUrl(item.media_url || item.image_url || '');
    setThumbnailUrl(item.thumbnail_url || '');
    setCaption(item.caption || '');
    setDisplayOrder(item.display_order || 0);
    setIsFeatured(Boolean(item.is_featured));
    setModalOpen(true);
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
        setMediaUrl(res.data.url);
        if (file.type.startsWith('video/')) {
          setMediaType('video_upload');
        } else {
          setMediaType('image');
          setThumbnailUrl(res.data.url);
        }
        success('Media file uploaded successfully');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to upload media file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !mediaUrl) {
      error('Title and Media URL / Upload are required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title,
        category,
        media_type: mediaType,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl || mediaUrl,
        caption,
        display_order: displayOrder,
        is_featured: isFeatured
      };

      if (editingItem) {
        const res = await api.put(`/cms/gallery/${editingItem.id}`, payload);
        if (res.data.success) {
          success('Gallery media updated successfully');
          setModalOpen(false);
          loadGallery();
        }
      } else {
        const res = await api.post('/cms/gallery', payload);
        if (res.data.success) {
          success('Gallery media added successfully');
          setModalOpen(false);
          loadGallery();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save gallery item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return;
    try {
      const res = await api.delete(`/cms/gallery/${id}`);
      if (res.data.success) {
        success('Gallery item deleted successfully');
        loadGallery();
      }
    } catch (err) {
      error('Failed to delete gallery item');
    }
  };

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Gallery Manager (Photos & Videos)
          </h1>
          <p className="text-xs text-gray-500">
            Upload monastery photos and videos, or paste YouTube/Vimeo video links for the public gallery.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add Photo / Video</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="bg-white p-4 rounded-lg border border-[#EBE5D8] flex items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search gallery by title, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7E1929]"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">
          Total: {filtered.length} media items
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="w-8 h-8 border-2 border-[#7E1929] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">Loading gallery...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="font-serif-brand font-bold text-base text-gray-700">No Gallery Items</h3>
          <p className="text-xs text-gray-500 mt-1">Click "Add Photo / Video" to upload media.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const isVid = item.media_type === 'video_upload' || item.media_type === 'video_url';
            return (
              <div key={item.id} className="monastery-card overflow-hidden group monastery-card-hover flex flex-col justify-between">
                <div className="relative h-44 bg-gray-900 overflow-hidden">
                  <img
                    src={item.thumbnail_url || item.media_url || item.image_url || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400'}
                    alt={item.title}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/75 text-[#D4AF37] flex items-center gap-1">
                    {isVid ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    <span>{isVid ? 'Video' : 'Photo'}</span>
                  </span>
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E2F]">{item.category}</span>
                    <h3 className="font-serif-brand font-bold text-xs text-[#4A0E17] line-clamp-1">{item.title}</h3>
                    {item.caption && <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{item.caption}</p>}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Order: {item.display_order}</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 rounded text-blue-600 hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D4AF37]/40 animate-fadeIn">
            <div className="p-5 bg-[#FAF5F0] border-b border-[#EBE5D8] flex items-center justify-between">
              <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
                {editingItem ? 'Edit Gallery Media' : 'Add Gallery Media'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Great Druk Wangyel Peace Stupa in Morning Light"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                >
                  <option value="Stupa Construction">Stupa Construction</option>
                  <option value="Puja & Ceremonies">Puja & Ceremonies</option>
                  <option value="Shedra Life">Shedra Life</option>
                  <option value="Monastic Arts">Monastic Arts</option>
                  <option value="Community Welfare">Community Welfare</option>
                </select>
              </div>

              {/* Media Type Tabs */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">Media Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image', label: 'Photo Image' },
                    { id: 'video_url', label: 'Video Link (YT)' },
                    { id: 'video_upload', label: 'Upload Video' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMediaType(t.id)}
                      className={`py-1.5 rounded text-xs font-bold border transition-all ${
                        mediaType === t.id ? 'bg-[#4A0E17] text-white border-[#4A0E17]' : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {mediaType === 'video_url' ? (
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-[11px]"
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="File path or image URL..."
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded font-mono text-[11px]"
                      />
                      <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded cursor-pointer font-bold flex items-center gap-1">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                        <input type="file" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail URL for videos */}
              {mediaType !== 'image' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Custom Thumbnail URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-[11px]"
                  />
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional brief description..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-5 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : editingItem ? 'Update Media' : 'Add Media'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
