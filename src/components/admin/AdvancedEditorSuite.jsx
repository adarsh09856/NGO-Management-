import React, { useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Search,
  Share2,
  Compass,
  Play,
  Plus,
  Trash2,
  UploadCloud,
  ExternalLink,
  Smartphone,
  Monitor,
  CheckCircle2,
  Eye,
  Video,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

export default function AdvancedEditorSuite({
  form,
  onChange,
  availableCategories = [
    'General',
    'Sacred Stupa',
    'Shedra Academy',
    'Butter Lamps',
    'Monastic Heritage',
    'Rituals & Pujas',
    'Pilgrimage',
    'Announcements'
  ],
  isCreatingCategory,
  setIsCreatingCategory,
  customCategoryInput,
  setCustomCategoryInput,
}) {
  const [activeTab, setActiveTab] = useState('CONTENT');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [serpDevice, setSerpDevice] = useState('desktop');

  const updateField = (key, value) => {
    onChange({ [key]: value });
  };

  // Auto-slugify title if slug is empty or user is typing title
  const handleTitleChange = (newTitle) => {
    updateField('title', newTitle);
    if (!form.slug || form.slug === slugify(form.title || '')) {
      updateField('slug', slugify(newTitle));
    }
  };

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Helper to extract clean embeddable video URL for live player preview
  const getEmbedVideoUrl = (url) => {
    if (!url) return null;
    const trimmed = url.trim();

    // YouTube watch or short links
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
    }

    // Vimeo links
    const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Direct MP4 / WebM
    if (trimmed.match(/\.(mp4|webm|ogg)$/i)) {
      return trimmed;
    }

    // If it's already an embed URL
    if (trimmed.includes('/embed/')) {
      return trimmed;
    }

    return null;
  };

  const embedVideoUrl = getEmbedVideoUrl(form.video_url || form.videoUrl || '');

  // File Upload Handler
  const handleFileUpload = async (e, type = 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);

    if (type === 'banner') setUploadingBanner(true);
    if (type === 'gallery') setUploadingGallery(true);

    try {
      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data.url) {
        if (type === 'banner') {
          updateField('banner_url', res.data.url);
          updateField('bannerUrl', res.data.url);
        } else if (type === 'gallery') {
          const currentGallery = form.gallery_images || form.galleryImages || [];
          const updated = [...currentGallery, { url: res.data.url, caption: '' }];
          updateField('gallery_images', updated);
          updateField('galleryImages', updated);
        }
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      if (type === 'banner') setUploadingBanner(false);
      if (type === 'gallery') setUploadingGallery(false);
    }
  };

  // Gallery item operations
  const galleryList = form.gallery_images || form.galleryImages || [];

  const addGalleryItem = () => {
    const updated = [...galleryList, { url: '', caption: '' }];
    updateField('gallery_images', updated);
    updateField('galleryImages', updated);
  };

  const updateGalleryItem = (index, field, value) => {
    const updated = [...galleryList];
    updated[index] = { ...updated[index], [field]: value };
    updateField('gallery_images', updated);
    updateField('galleryImages', updated);
  };

  const removeGalleryItem = (index) => {
    const updated = galleryList.filter((_, i) => i !== index);
    updateField('gallery_images', updated);
    updateField('galleryImages', updated);
  };

  // Social Links helper
  const socialObj = form.social_links || form.socialLinks || {};
  const updateSocial = (platform, val) => {
    const updated = { ...socialObj, [platform]: val };
    updateField('social_links', updated);
    updateField('socialLinks', updated);
  };

  // CTA Button helper
  const ctaObj = form.cta_button || form.ctaButton || { label: '', url: '', style: 'primary' };
  const updateCta = (field, val) => {
    const updated = { ...ctaObj, [field]: val };
    updateField('cta_button', updated);
    updateField('ctaButton', updated);
  };

  const metaTitleLen = (form.seo_title || form.seoTitle || form.title || '').length;
  const metaDescLen = (form.seo_description || form.seoDescription || form.excerpt || '').length;

  return (
    <div className="space-y-4">
      {/* 5-Tab Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto no-scrollbar bg-gray-50/70 p-1.5 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('CONTENT')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'CONTENT'
              ? 'bg-white text-[#8B2E24] shadow-xs border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>1. Content & Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MEDIA')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'MEDIA'
              ? 'bg-white text-[#8B2E24] shadow-xs border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>2. Media & Video Preview</span>
          {galleryList.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-bold">
              {galleryList.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SEO')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'SEO'
              ? 'bg-white text-[#8B2E24] shadow-xs border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>3. SEO & Google Preview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SOCIAL')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'SOCIAL'
              ? 'bg-white text-[#8B2E24] shadow-xs border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>4. Social & CTA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MENUS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'MENUS'
              ? 'bg-white text-[#8B2E24] shadow-xs border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>5. Menus & Status</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CONTENT & TEXT                                     */}
      {/* ========================================================= */}
      {activeTab === 'CONTENT' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Relics of the 108ft Peace Stupa"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B2E24] focus:border-[#8B2E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-xl border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-[#8B2E24] focus-within:border-[#8B2E24] bg-white">
                <span className="px-2.5 py-2 bg-gray-100 text-gray-500 text-xs border-r border-gray-200 font-mono">
                  /pages/
                </span>
                <input
                  type="text"
                  required
                  value={form.slug || ''}
                  onChange={(e) => updateField('slug', slugify(e.target.value))}
                  placeholder="relics-peace-stupa"
                  className="w-full px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Category with Inline Creation Switcher */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                Page Category
              </label>
              {!isCreatingCategory ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#8B2E24] hover:underline font-semibold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Create New Category</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCategory(false);
                    if (setCustomCategoryInput) setCustomCategoryInput('');
                  }}
                  className="text-[11px] text-gray-500 hover:underline cursor-pointer"
                >
                  Choose existing category
                </button>
              )}
            </div>

            {isCreatingCategory ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customCategoryInput || ''}
                  onChange={(e) => setCustomCategoryInput && setCustomCategoryInput(e.target.value)}
                  placeholder="Type new category name..."
                  className="flex-1 px-3 py-2 border border-[#8B2E24] rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customCategoryInput && customCategoryInput.trim()) {
                      updateField('category', customCategoryInput.trim());
                    }
                    setIsCreatingCategory(false);
                  }}
                  className="px-3.5 py-2 bg-[#8B2E24] text-white rounded-xl text-xs font-bold hover:bg-[#a0362b] shrink-0 cursor-pointer"
                >
                  Use
                </button>
              </div>
            ) : (
              <select
                value={form.category || 'General'}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24] focus:border-[#8B2E24]"
              >
                {Array.from(new Set([...availableCategories, form.category].filter(Boolean))).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Introductory Summary / Lede Excerpt
            </label>
            <textarea
              rows={2}
              value={form.excerpt || ''}
              onChange={(e) => updateField('excerpt', e.target.value)}
              placeholder="A concise introductory paragraph summarizing the page narrative..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B2E24] focus:border-[#8B2E24]"
            />
          </div>

          {/* Rich Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                Page Narrative &amp; Content (Formatted Text &amp; Sections)
              </label>
              <span className="text-[11px] text-gray-400">Supports HTML / Markdown tags</span>
            </div>

            {/* Quick Markdown Toolbar */}
            <div className="flex items-center gap-1.5 p-1.5 bg-gray-100 border border-gray-200 rounded-t-xl text-xs text-gray-700 overflow-x-auto">
              <button
                type="button"
                onClick={() => updateField('content', (form.content || '') + '\n\n## Subheading Title\n')}
                className="px-2 py-1 rounded bg-white hover:bg-gray-200 font-bold text-[11px] border border-gray-300"
                title="Add Section Header"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => updateField('content', (form.content || '') + '\n\n### Minor Heading\n')}
                className="px-2 py-1 rounded bg-white hover:bg-gray-200 font-bold text-[11px] border border-gray-300"
                title="Add Minor Header"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => updateField('content', (form.content || '') + ' **bold text** ')}
                className="px-2 py-1 rounded bg-white hover:bg-gray-200 font-bold text-[11px] border border-gray-300"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => updateField('content', (form.content || '') + ' *italic text* ')}
                className="px-2 py-1 rounded bg-white hover:bg-gray-200 italic text-[11px] border border-gray-300"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => updateField('content', (form.content || '') + '\n\n> Sacred Buddhist Quote or Proclamation\n')}
                className="px-2 py-1 rounded bg-white hover:bg-gray-200 text-[11px] border border-gray-300"
              >
                Quote
              </button>
              <button
                type="button"
                onClick={() => updateField('content', (form.content || '') + '\n\n- Key Point 1\n- Key Point 2\n- Key Point 3\n')}
                className="px-2 py-1 rounded bg-white hover:bg-gray-200 text-[11px] border border-gray-300"
              >
                List
              </button>
            </div>

            <textarea
              rows={10}
              value={form.content || ''}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder="Write the full sacred chronicle, description, history, or guidelines for this page..."
              className="w-full px-3 py-2 border border-t-0 border-gray-300 rounded-b-xl text-xs sm:text-sm text-gray-900 font-sans focus:outline-none focus:ring-1 focus:ring-[#8B2E24] focus:border-[#8B2E24]"
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MEDIA & VIDEO PREVIEW                              */}
      {/* ========================================================= */}
      {activeTab === 'MEDIA' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Cover Banner Hero Image</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={form.banner_url || form.bannerUrl || ''}
                onChange={(e) => {
                  updateField('banner_url', e.target.value);
                  updateField('bannerUrl', e.target.value);
                }}
                placeholder="https://images.unsplash.com/... or upload"
                className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
              />

              <label className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs">
                <UploadCloud className="w-3.5 h-3.5 text-[#8B2E24]" />
                <span>{uploadingBanner ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'banner')}
                  disabled={uploadingBanner}
                />
              </label>
            </div>

            {(form.banner_url || form.bannerUrl) && (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 h-36 bg-gray-900">
                <img
                  src={form.banner_url || form.bannerUrl}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <button
                  type="button"
                  onClick={() => {
                    updateField('banner_url', '');
                    updateField('bannerUrl', '');
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black text-xs font-semibold cursor-pointer"
                  title="Remove banner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Interactive Playable Video Player */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#8B2E24]" />
                <span>Featured Video Embed &amp; Live Player Preview</span>
              </h3>
              <span className="text-[10px] text-gray-500">Supports YouTube, Vimeo, MP4</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Video URL
              </label>
              <input
                type="text"
                value={form.video_url || form.videoUrl || ''}
                onChange={(e) => {
                  updateField('video_url', e.target.value);
                  updateField('videoUrl', e.target.value);
                }}
                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://vimeo.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Paste any YouTube watch link, youtu.be short link, Vimeo URL, or direct MP4. The system automatically converts it into a responsive player.
              </p>
            </div>

            {/* In-Editor Live Playable Video Player */}
            {embedVideoUrl ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Video Player Preview Active (Admins can test playback below):</span>
                  </span>
                  <a
                    href={form.video_url || form.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900"
                  >
                    <span>Open in new tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-amber-300 shadow-md bg-black">
                  {embedVideoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video controls src={embedVideoUrl} className="w-full h-full object-cover">
                      Your browser does not support HTML video.
                    </video>
                  ) : (
                    <iframe
                      src={embedVideoUrl}
                      title="Video preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            ) : (form.video_url || form.videoUrl) ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Could not detect standard YouTube/Vimeo ID. Link will still be provided as direct video anchor on public page.</span>
              </div>
            ) : null}
          </div>

          {/* Multi-Photo Gallery Manager */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Photo Gallery Manager &amp; Captions</span>
                </h3>
                <p className="text-[11px] text-gray-500">
                  Add photos that will render in a high-res responsive grid on this custom page.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs">
                  <UploadCloud className="w-3 h-3 text-[#8B2E24]" />
                  <span>{uploadingGallery ? 'Uploading...' : '+ Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'gallery')}
                    disabled={uploadingGallery}
                  />
                </label>

                <button
                  type="button"
                  onClick={addGalleryItem}
                  className="px-3 py-1.5 bg-[#8B2E24] text-white hover:bg-[#a0362b] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add URL</span>
                </button>
              </div>
            </div>

            {galleryList.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-300 rounded-xl text-center text-xs text-gray-500 bg-white">
                No gallery photos added yet. Click "+ Upload Photo" or "+ Add URL" to showcase ceremonies, stupa architecture, or monastic assemblies.
              </div>
            ) : (
              <div className="space-y-2.5">
                {galleryList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-2 p-2.5 bg-white border border-gray-200 rounded-xl shadow-xs"
                  >
                    {item.url ? (
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-900">
                        <img
                          src={item.url}
                          alt="Gallery thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg border border-dashed border-gray-300 flex items-center justify-center shrink-0 text-gray-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1 w-full space-y-1.5">
                      <input
                        type="text"
                        value={item.url || ''}
                        onChange={(e) => updateGalleryItem(idx, 'url', e.target.value)}
                        placeholder="Image URL (https://...)"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                      />
                      <input
                        type="text"
                        value={item.caption || ''}
                        onChange={(e) => updateGalleryItem(idx, 'caption', e.target.value)}
                        placeholder="Photo Caption (e.g. Consecration assembly at the main shrine)"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeGalleryItem(idx)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SEO SUITE & LIVE SERP PREVIEW                      */}
      {/* ========================================================= */}
      {activeTab === 'SEO' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Meta Title with 0/60 counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Search Engine Meta Title
                </label>
                <span
                  className={`text-[10.5px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    metaTitleLen > 60
                      ? 'bg-amber-100 text-amber-800'
                      : metaTitleLen > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-gray-400'
                  }`}
                >
                  {metaTitleLen}/60 chars
                </span>
              </div>
              <input
                type="text"
                value={form.seo_title || form.seoTitle || ''}
                onChange={(e) => {
                  updateField('seo_title', e.target.value);
                  updateField('seoTitle', e.target.value);
                }}
                placeholder={form.title ? `${form.title} · Drodul Phendey Ling` : 'Page Title · Drodul Phendey Ling'}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Recommended 50–60 characters. Shows as blue headline on Google Search.
              </p>
            </div>

            {/* Focus Keywords */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Focus Keywords (Comma-Separated)
              </label>
              <input
                type="text"
                value={form.seo_keywords || form.seoKeywords || ''}
                onChange={(e) => {
                  updateField('seo_keywords', e.target.value);
                  updateField('seoKeywords', e.target.value);
                }}
                placeholder="e.g. Peace Stupa, Gelephu Bhutan, Vajrayana, Shedra"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Target search queries for search indexing &amp; on-site search.
              </p>
            </div>
          </div>

          {/* Meta Description with 0/160 counter */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                Search Engine Meta Description
              </label>
              <span
                className={`text-[10.5px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                  metaDescLen > 160
                    ? 'bg-amber-100 text-amber-800'
                    : metaDescLen > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-gray-400'
                }`}
              >
                {metaDescLen}/160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={form.seo_description || form.seoDescription || ''}
              onChange={(e) => {
                updateField('seo_description', e.target.value);
                updateField('seoDescription', e.target.value);
              }}
              placeholder={form.excerpt || 'Concise summary for Google search snippet and social cards...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Recommended 120–160 characters. Shows beneath the link on Google SERP.
            </p>
          </div>

          {/* LIVE GOOGLE SERP PREVIEW BOX */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Live Google Search Snippet Simulation (SERP)</span>
              </h4>

              {/* Desktop / Mobile Toggle */}
              <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSerpDevice('desktop')}
                  className={`p-1 rounded flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                    serpDevice === 'desktop' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-500'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSerpDevice('mobile')}
                  className={`p-1 rounded flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                    serpDevice === 'mobile' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-500'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Google Result Card */}
            <div
              className={`bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1 ${
                serpDevice === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
              }`}
            >
              <div className="flex items-center gap-2 text-[12px] text-gray-800 truncate">
                <div className="w-5 h-5 rounded-full bg-[#0F172A] text-[#D4AF37] flex items-center justify-center text-[10px] font-serif shrink-0">
                  ☸
                </div>
                <div className="truncate">
                  <span className="text-gray-800 font-medium text-[11px]">drodulphendeyling.org</span>
                  <span className="text-gray-400 text-[11px] font-mono mx-1">› pages ›</span>
                  <span className="text-gray-600 text-[11px] font-mono">
                    {form.slug || 'page-slug'}
                  </span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-1">
                {(form.seo_title || form.seoTitle || form.title || 'Page Title') + ' · Drodul Phendey Ling'}
              </h3>

              <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {form.seo_description ||
                  form.seoDescription ||
                  form.excerpt ||
                  'Discover sacred teachings, peace stupa construction chronicles, and monastic heritage from Drodul Phendey Ling Foundation in Gelephu, Bhutan.'}
              </p>
            </div>
          </div>

          {/* LIVE SOCIAL SHARE CARD PREVIEW */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Live Social Share Card Simulation (Facebook / Twitter / WhatsApp)</span>
            </h4>

            <div className="max-w-md bg-white rounded-xl border border-gray-300 overflow-hidden shadow-xs">
              <div className="h-44 bg-gray-900 relative">
                {(form.banner_url || form.bannerUrl) ? (
                  <img
                    src={form.banner_url || form.bannerUrl}
                    alt="Social preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                    <span className="text-xs">No cover image uploaded</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-1">
                <span className="text-[10px] uppercase font-mono text-gray-500 font-semibold tracking-wider">
                  DRODULPHENDEYLING.ORG
                </span>
                <h4 className="text-xs font-bold text-gray-900 truncate">
                  {form.seo_title || form.seoTitle || form.title || 'Page Title'}
                </h4>
                <p className="text-[11px] text-gray-600 line-clamp-2">
                  {form.seo_description || form.seoDescription || form.excerpt || 'Sacred chronicles from Drodul Phendey Ling Foundation.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SOCIAL CONNECT & CALL TO ACTION                   */}
      {/* ========================================================= */}
      {activeTab === 'SOCIAL' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Social Profiles */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Social Links Connect Bar</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Provide outbound social channels to display in the social connect ribbon at the bottom of this page.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Facebook Page URL
                </label>
                <input
                  type="text"
                  value={socialObj.facebook || ''}
                  onChange={(e) => updateSocial('facebook', e.target.value)}
                  placeholder="https://facebook.com/drodulphendeyling"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="text"
                  value={socialObj.instagram || ''}
                  onChange={(e) => updateSocial('instagram', e.target.value)}
                  placeholder="https://instagram.com/drodulphendeyling"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  YouTube Channel URL
                </label>
                <input
                  type="text"
                  value={socialObj.youtube || ''}
                  onChange={(e) => updateSocial('youtube', e.target.value)}
                  placeholder="https://youtube.com/@drodulphendeyling"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  WhatsApp Contact / Devotee Group URL
                </label>
                <input
                  type="text"
                  value={socialObj.whatsapp || ''}
                  onChange={(e) => updateSocial('whatsapp', e.target.value)}
                  placeholder="https://wa.me/97517556559"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                />
              </div>
            </div>
          </div>

          {/* Call-to-Action Builder */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#8B2E24]" />
              <span>Call-to-Action (CTA) Banner Builder</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Attach an action banner (e.g. Offer Dana, Register for Retreat, Request Prayers) at the foot of this custom page.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  value={ctaObj.label || ''}
                  onChange={(e) => updateCta('label', e.target.value)}
                  placeholder="e.g. Offer Dana for Stupa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={ctaObj.url || ''}
                  onChange={(e) => updateCta('url', e.target.value)}
                  placeholder="/donate or https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Visual Style
                </label>
                <select
                  value={ctaObj.style || 'primary'}
                  onChange={(e) => updateCta('style', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                >
                  <option value="primary">Sacred Amber Gold (Primary)</option>
                  <option value="secondary">Deep Burgundy / Red (Secondary)</option>
                  <option value="outline">Clean Outline / White</option>
                </select>
              </div>
            </div>

            {ctaObj.label && (
              <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">CTA Button Preview:</span>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    ctaObj.style === 'secondary'
                      ? 'bg-[#8B2E24] text-white hover:bg-[#a0362b]'
                      : ctaObj.style === 'outline'
                      ? 'border-2 border-[#D4AF37] text-[#D4AF37] bg-transparent'
                      : 'bg-[#D4AF37] text-[#0F172A] hover:bg-[#b89528]'
                  }`}
                >
                  {ctaObj.label}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: MENUS & PUBLISHING STATUS                          */}
      {/* ========================================================= */}
      {activeTab === 'MENUS' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
              Publishing &amp; Public Visibility
            </h3>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.is_published !== undefined ? form.is_published : (form.isPublished !== undefined ? form.isPublished : true))}
                onChange={(e) => {
                  updateField('is_published', e.target.checked);
                  updateField('isPublished', e.target.checked);
                }}
                className="w-4 h-4 text-[#8B2E24] rounded border-gray-300 focus:ring-[#8B2E24] mt-0.5"
              />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  Published (Publicly Accessible)
                </p>
                <p className="text-[11px] text-gray-500">
                  When unchecked, the page is saved as an internal draft. Public visitors will receive a clean 404, while logged-in administrators can preview it.
                </p>
              </div>
            </label>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
              Site Navigation Menus Integration
            </h3>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.show_in_header_nav || form.showInHeaderNav)}
                onChange={(e) => {
                  updateField('show_in_header_nav', e.target.checked);
                  updateField('showInHeaderNav', e.target.checked);
                }}
                className="w-4 h-4 text-[#8B2E24] rounded border-gray-300 focus:ring-[#8B2E24] mt-0.5"
              />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  Show in Header Navigation Bar
                </p>
                <p className="text-[11px] text-gray-500">
                  Automatically adds a direct link to this page in the main website top navbar.
                </p>
              </div>
            </label>

            <div className="border-t border-gray-200/60 pt-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form.show_in_footer_nav || form.showInFooterNav)}
                  onChange={(e) => {
                    updateField('show_in_footer_nav', e.target.checked);
                    updateField('showInFooterNav', e.target.checked);
                  }}
                  className="w-4 h-4 text-[#8B2E24] rounded border-gray-300 focus:ring-[#8B2E24] mt-0.5"
                />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    Show in Footer Quick Links
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Automatically adds a direct link in the footer sacred programs or about column.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
