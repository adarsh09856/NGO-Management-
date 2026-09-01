import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Play, Film, Image as ImageIcon, Sparkles } from 'lucide-react';
import api from '../../services/api';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('All');
  const [lightboxItem, setLightboxItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (category !== 'All') params.append('category', category);
        if (mediaTypeFilter !== 'All') params.append('type', mediaTypeFilter);

        const res = await api.get(`/cms/gallery?${params.toString()}`);
        if (res.data.success) {
          setItems(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, [category, mediaTypeFilter]);

  const categories = ['All', 'Stupa Construction', 'Puja & Ceremonies', 'Shedra Life', 'Monastic Arts'];

  const defaultGallery = [
    { id: 1, title: 'Great Druk Wangyel Peace Stupa in Morning Light', category: 'Stupa Construction', media_type: 'image', media_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', thumbnail_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80', caption: 'The magnificent stupa rising against the serene foothills of Gelephu, Bhutan.' },
    { id: 2, title: 'Monks Chanting in Shedra Assembly Hall', category: 'Shedra Life', media_type: 'image', media_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80', thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80', caption: 'Resident monastic students reciting sacred Prajnaparamita texts.' },
    { id: 3, title: 'Consecration Ceremony & 1000 Butter Lamps', category: 'Puja & Ceremonies', media_type: 'video_url', media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80', caption: 'Official footage of the 1000 Butter Lamps world peace dedication ritual.' },
    { id: 4, title: 'Traditional Stone Carving Artisans at Work', category: 'Monastic Arts', media_type: 'image', media_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80', thumbnail_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80', caption: 'Master craftsmen carving auspicious Buddhist motifs for the Stupa base.' },
    { id: 5, title: 'Punakha Dzong & Monastic Heritage', category: 'Puja & Ceremonies', media_type: 'video_url', media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail_url: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80', caption: 'Historic fortress monastery on the banks of the Mo Chhu river.' }
  ];

  const displayItems = items.length > 0 ? items : defaultGallery;

  const isVideo = (item) => {
    return item.media_type === 'video_upload' || item.media_type === 'video_url' || item.media_url?.includes('youtube') || item.media_url?.includes('youtu.be') || item.media_url?.includes('vimeo') || item.media_url?.endsWith('.mp4');
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

  return (
    <div className="min-h-screen py-12 px-4 sm:px-8 relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="glow-pill-gold px-3.5 py-1 rounded-full text-xs font-bold">
            Sacred Moments
          </span>
          <h1 className="font-serif-brand font-extrabold text-3xl sm:text-4xl text-[#0F172A]">
            Monastery Photo & Video Gallery
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-light">
            Witness the sacred construction of the Great Druk Wangyel Peace Stupa, Shedra monastic student life, and sacred ceremonies in Gelephu, Bhutan.
          </p>
        </div>

        {/* Filter Controls: Media Type Tabs + Categories */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 glass-panel p-4 rounded-2xl border border-white/80 shadow-md">
          {/* Media Type Filter */}
          <div className="flex items-center bg-gray-100/80 p-1 rounded-full border border-gray-200">
            {['All', 'Photos', 'Videos'].map((t) => (
              <button
                key={t}
                onClick={() => setMediaTypeFilter(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  mediaTypeFilter === t
                    ? 'bg-[#0F172A] text-[#D4AF37] shadow-sm'
                    : 'text-gray-700 hover:text-[#0F172A]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-[#0F172A] text-white shadow'
                    : 'bg-white/80 text-gray-700 hover:bg-white hover:text-[#0F172A] border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry / Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading gallery...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className="glass-card-interactive overflow-hidden rounded-2xl cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative h-60 overflow-hidden bg-gray-950">
                  <img
                    src={item.thumbnail_url || item.media_url}
                    alt={item.title}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />

                  {/* Badges */}
                  <span className="absolute top-3 left-3 glow-pill-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {item.category}
                  </span>

                  {/* Video / Zoom Icon */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#0F172A]/90 text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center shadow-xl">
                      {isVideo(item) ? (
                        <Play className="w-5 h-5 fill-[#D4AF37] ml-0.5" />
                      ) : (
                        <ZoomIn className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] group-hover:text-[#BE123C] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {item.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Video Modal */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-gray-950 rounded-2xl overflow-hidden border border-[#D4AF37]/50 shadow-2xl">
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#BE123C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isVideo(lightboxItem) ? (
              <div className="aspect-video w-full bg-black">
                <iframe
                  className="w-full h-full"
                  src={getEmbedUrl(lightboxItem.media_url)}
                  title={lightboxItem.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="max-h-[75vh] flex items-center justify-center bg-black overflow-hidden">
                <img
                  src={lightboxItem.media_url}
                  alt={lightboxItem.title}
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>
            )}

            <div className="p-6 bg-[#1a050a] text-white space-y-2 border-t border-[#D4AF37]/30">
              <span className="glow-pill-gold px-2.5 py-0.5 rounded text-[10px] font-bold">
                {lightboxItem.category}
              </span>
              <h2 className="font-serif-brand font-bold text-lg text-white">
                {lightboxItem.title}
              </h2>
              <p className="text-xs text-gray-300">
                {lightboxItem.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
