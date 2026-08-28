import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Play, Video, Link as LinkIcon, UploadCloud,
  Search, BookOpen, Save, X, GraduationCap, Clock, CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function LearningManager() {
  const { success, error } = useToast();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activePreviewVideo, setActivePreviewVideo] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Buddhist Philosophy');
  const [mediaType, setMediaType] = useState('video_url'); // 'video_url', 'video_upload'
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [instructor, setInstructor] = useState('Khenpo Tashi Dorji');
  const [duration, setDuration] = useState('45 mins');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    try {
      setLoading(true);
      const res = await api.get('/learning');
      if (res.data.success) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load learning materials:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setCategory('Buddhist Philosophy');
    setMediaType('video_url');
    setMediaUrl('');
    setThumbnailUrl('https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800');
    setInstructor('Khenpo Tashi Dorji');
    setDuration('45 mins');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setCategory(item.category || 'Buddhist Philosophy');
    setMediaType(item.media_type || 'video_url');
    setMediaUrl(item.media_url || '');
    setThumbnailUrl(item.thumbnail_url || '');
    setInstructor(item.instructor || 'Khenpo Tashi Dorji');
    setDuration(item.duration || '45 mins');
    setModalOpen(true);
  };

  // Video File Upload Handler
  const handleVideoUpload = async (e) => {
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
        setMediaType('video_upload');
        success('Video file uploaded successfully to server');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to upload video file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !mediaUrl) {
      error('Please provide a title and video URL or upload a video file');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title,
        description,
        category,
        media_type: mediaType,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl,
        instructor,
        duration
      };

      if (editingItem) {
        const res = await api.put(`/learning/${editingItem.id}`, payload);
        if (res.data.success) {
          success('Learning video updated successfully');
          setModalOpen(false);
          loadMaterials();
        }
      } else {
        const res = await api.post('/learning', payload);
        if (res.data.success) {
          success('Learning video published successfully');
          setModalOpen(false);
          loadMaterials();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save learning video');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this learning video?')) return;
    try {
      const res = await api.delete(`/learning/${id}`);
      if (res.data.success) {
        success('Learning video deleted successfully');
        loadMaterials();
      }
    } catch (err) {
      error('Failed to delete learning video');
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  };

  const isEmbeddableVideo = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com'));
  };

  const filtered = materials.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Learning & Training Videos Manager
          </h1>
          <p className="text-xs text-gray-500">
            Upload Dharma video lectures or paste YouTube/Vimeo links displayed on the public Learning page.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Add Video</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="bg-white p-4 rounded-lg border border-[#EBE5D8] flex items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search teachings by title, instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7E1929]"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">
          Total: {filtered.length} lectures
        </span>
      </div>

      {/* Videos List Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="w-8 h-8 border-2 border-[#7E1929] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">Loading learning library...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="font-serif-brand font-bold text-base text-gray-700">No Learning Videos</h3>
          <p className="text-xs text-gray-500 mt-1">Click "Upload / Add Video" to publish a video teaching.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="monastery-card overflow-hidden flex flex-col justify-between">
              {/* Video Thumbnail */}
              <div className="relative h-44 bg-gray-900 overflow-hidden group">
                <img
                  src={item.thumbnail_url || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-90"
                />
                <button
                  onClick={() => setActivePreviewVideo(item)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-white/95 text-[#4A0E17] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-[#4A0E17] ml-0.5" />
                  </div>
                </button>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#4A0E17]/90 text-[#D4AF37]">
                  {item.category}
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                  {item.duration || 'Video'}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium truncate max-w-[130px]">
                    {item.instructor}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded text-blue-600 hover:bg-blue-50"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Add Video Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D4AF37]/40 animate-fadeIn">
            <div className="p-5 bg-[#FAF5F0] border-b border-[#EBE5D8] flex items-center justify-between">
              <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
                {editingItem ? 'Edit Learning Video' : 'Add New Learning Video'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Teaching / Lecture Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to the Four Noble Truths"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                />
              </div>

              {/* Video Source Option */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">Video Source *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaType('video_url')}
                    className={`flex-1 py-2 rounded border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      mediaType === 'video_url' ? 'bg-[#4A0E17] text-white border-[#4A0E17]' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>YouTube / Vimeo Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video_upload')}
                    className={`flex-1 py-2 rounded border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      mediaType === 'video_upload' ? 'bg-[#4A0E17] text-white border-[#4A0E17]' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Video File</span>
                  </button>
                </div>

                {mediaType === 'video_url' ? (
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none font-mono text-[11px]"
                  />
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center space-y-2 bg-[#FAF9F5]">
                    <UploadCloud className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-xs text-gray-600">
                      {mediaUrl ? `Uploaded: ${mediaUrl}` : 'Upload video file (.mp4, .webm, max 100MB)'}
                    </p>
                    <label className="inline-block px-4 py-1.5 bg-[#4A0E17] text-white rounded cursor-pointer font-bold hover:bg-[#5A121E]">
                      <span>{uploading ? 'Uploading Video...' : 'Choose File'}</span>
                      <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              {/* Category, Instructor & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                  >
                    <option value="Buddhist Philosophy">Buddhist Philosophy</option>
                    <option value="Meditation & Retreats">Meditation & Retreats</option>
                    <option value="Dharma Teachings">Dharma Teachings</option>
                    <option value="Monastic Arts">Monastic Arts</option>
                    <option value="Tibetan Language">Tibetan Language</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Instructor / Speaker</label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 45 mins"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                  />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none font-mono text-[11px]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Lecture Description</label>
                <textarea
                  rows={3}
                  placeholder="Summary of the philosophical discourse or meditation topic..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                />
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
                  disabled={saving || uploading}
                  className="px-5 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : editingItem ? 'Update Video' : 'Publish Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {activePreviewVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#1F0408] border border-[#D4AF37]/40 rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl animate-fadeIn">
            <div className="p-4 bg-[#2C060D] border-b border-[#5A121E] flex items-center justify-between text-white">
              <h3 className="font-serif-brand font-bold text-sm text-white">{activePreviewVideo.title}</h3>
              <button onClick={() => setActivePreviewVideo(null)} className="text-white hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              {isEmbeddableVideo(activePreviewVideo.media_url) ? (
                <iframe
                  className="w-full h-full"
                  src={getEmbedUrl(activePreviewVideo.media_url)}
                  title={activePreviewVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  className="w-full h-full"
                  controls
                  autoPlay
                  src={activePreviewVideo.media_url}
                >
                  Your browser does not support HTML5 video playback.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
