import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Play, Film, Image as ImageIcon, Sparkles } from 'lucide-react';
import api from '../../services/api';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('All'); // 'All', 'Photos', 'Videos'
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

  const categories = ['All', 'Stupa Construction', 'Puja & Ceremonies', 'Shedra Life', 'Monastic Arts', 'Community Welfare'];

  // Helper for YouTube / Vimeo embed URL
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

  const isVideo = (item) => {
    return item.media_type === 'video_upload' || item.media_type === 'video_url' || item.media_url?.includes('youtube') || item.media_url?.includes('youtu.be') || item.media_url?.includes('vimeo') || item.media_url?.endsWith('.mp4');
  };

  const isEmbeddableVideo = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com'));
  };

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-8 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="font-serif-brand font-extrabold text-3xl sm:text-4xl text-[#4A0E17]">
            Monastery Photo & Video Gallery
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Witness the sacred construction of the Great Druk Wangyel Peace Stupa, Shedra monastic student life, sacred pujas, and documentary video footage from Gelephu, Bhutan.
          </p>
        </div>

        {/* Filter Controls: Media Type Tabs + Categories */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          {/* Media Type Filter */}
          <div className="flex items-center bg-white p-1 rounded-full border border-[#EBE5D8] shadow-sm">
            {['All', 'Photos', 'Videos'].map((t) => (
              <button
                key={t}
                onClick={() => setMediaTypeFilter(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  mediaTypeFilter === t
                    ? 'bg-[#4A0E17] text-white shadow'
                    : 'text-gray-700 hover:text-[#4A0E17]'
                }`}
              >
                {t === 'All' ? 'All Media' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                category === cat
                  ? 'bg-[#7E1929] text-white shadow'
                  : 'bg-white text-gray-700 border border-[#EBE5D8] hover:border-[#D4AF37]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#7E1929] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading gallery media...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-serif-brand font-bold text-base text-gray-700">No Media Found</h3>
            <p className="text-xs text-gray-500 mt-1">Try choosing another category or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item) => {
              const video = isVideo(item);
              const previewImg = item.thumbnail_url || (video ? 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800' : item.media_url || item.image_url);

              return (
                <div
                  key={item.id}
                  onClick={() => setLightboxItem(item)}
                  className="group relative h-64 rounded-xl overflow-hidden shadow-sm border border-[#EBE5D8] bg-gray-900 cursor-pointer monastery-card-hover"
                >
                  <img
                    src={previewImg}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />

                  {/* Gradient Overlay & Badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                  {/* Center Play Icon for Video */}
                  {video && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/95 text-[#4A0E17] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-[#4A0E17] ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Top Type Indicator */}
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-[#D4AF37] backdrop-blur-sm border border-[#D4AF37]/30 flex items-center gap-1">
                    {video ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    <span>{video ? 'Video' : 'Photo'}</span>
                  </span>

                  {/* Bottom Captions */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[10px] text-[#D4AF37] font-semibold tracking-wider uppercase">{item.category}</p>
                    <h3 className="font-serif-brand font-bold text-xs sm:text-sm line-clamp-1 leading-snug">{item.title}</h3>
                    {item.caption && <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5">{item.caption}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Video Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#1F0408] rounded-2xl overflow-hidden shadow-2xl border border-[#D4AF37]/40 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-[#2C060D] border-b border-[#5A121E] flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">{lightboxItem.category}</span>
                <h3 className="font-serif-brand font-bold text-sm sm:text-base text-white">{lightboxItem.title}</h3>
              </div>
              <button
                onClick={() => setLightboxItem(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Player or Full-Res Photo */}
            <div className="relative bg-black flex items-center justify-center min-h-[360px] max-h-[70vh]">
              {isVideo(lightboxItem) ? (
                isEmbeddableVideo(lightboxItem.media_url) ? (
                  <iframe
                    className="w-full aspect-video"
                    src={getEmbedUrl(lightboxItem.media_url)}
                    title={lightboxItem.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    className="w-full max-h-[70vh]"
                    controls
                    autoPlay
                    src={lightboxItem.media_url.startsWith('http') ? lightboxItem.media_url : `${lightboxItem.media_url}`}
                  >
                    Your browser does not support HTML5 video playback.
                  </video>
                )
              ) : (
                <img
                  src={lightboxItem.media_url || lightboxItem.image_url}
                  alt={lightboxItem.title}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              )}
            </div>

            {/* Caption */}
            {lightboxItem.caption && (
              <div className="p-4 bg-[#2C060D] text-gray-300 text-xs border-t border-[#5A121E]">
                {lightboxItem.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
