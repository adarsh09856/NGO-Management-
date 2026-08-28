import React, { useState, useEffect } from 'react';
import { Play, Search, GraduationCap, Clock, BookOpen, Compass, Flame, Sparkles, Filter, X } from 'lucide-react';
import api from '../../services/api';

export default function Learning() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null); // Active video modal

  useEffect(() => {
    async function loadMaterials() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        if (searchQuery) params.append('q', searchQuery);

        const res = await api.get(`/learning?${params.toString()}`);
        if (res.data.success) {
          setMaterials(res.data.data);
          if (res.data.categories) setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load learning materials:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMaterials();
  }, [selectedCategory, searchQuery]);

  // Helper to get embed URL for YouTube / Vimeo
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

  return (
    <div className="w-full bg-[#FDFBF7] min-h-screen py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#2C060D] via-[#4A0E17] to-[#1F0408] rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl border border-[#D4AF37]/30">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="text-[#D4AF37] font-semibold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <span>☸</span> Open Monastic Dharma Education
            </span>
            <h1 className="font-serif-brand font-extrabold text-2xl sm:text-4xl text-white tracking-wide">
              Learning & Dharma Video Discourses
            </h1>
            <p className="text-xs sm:text-sm text-[#F3F4F6] font-light leading-relaxed">
              Explore authentic Tibetan Buddhist teachings, meditation instructions, and philosophical commentaries presented by our revered Khenpos and resident masters.
            </p>
          </div>
        </div>

        {/* Controls: Search & Category Filter Pills */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-[#EBE5D8] shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#4A0E17] text-white shadow'
                    : 'bg-[#F8F6F0] text-gray-700 hover:bg-[#FDF6E2] hover:text-[#4A0E17]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search lectures & topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7E1929] bg-[#FAF9F5]"
            />
          </div>
        </div>

        {/* Video Lectures Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#7E1929] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading Dharma lectures...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-serif-brand font-bold text-base text-gray-700">No Teachings Found</h3>
            <p className="text-xs text-gray-500 mt-1">Try selecting a different category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((item) => (
              <div
                key={item.id}
                className="monastery-card overflow-hidden group monastery-card-hover flex flex-col justify-between"
              >
                {/* Thumbnail with Play Trigger */}
                <div
                  className="relative h-48 bg-gray-900 cursor-pointer overflow-hidden"
                  onClick={() => setActiveVideo(item)}
                >
                  <img
                    src={item.thumbnail_url || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white/95 text-[#4A0E17] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-[#4A0E17] ml-0.5" />
                    </div>
                  </div>
                  {/* Category & Duration Badges */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#4A0E17]/90 text-[#D4AF37] backdrop-blur-sm border border-[#D4AF37]/30">
                    {item.category}
                  </span>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-black/75 text-white flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.duration || 'Video'}</span>
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3
                      className="font-serif-brand font-bold text-sm text-[#4A0E17] group-hover:text-[#7E1929] transition-colors leading-snug cursor-pointer"
                      onClick={() => setActiveVideo(item)}
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                      <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{item.instructor}</span>
                    </div>

                    <button
                      onClick={() => setActiveVideo(item)}
                      className="text-xs font-bold text-[#7E1929] hover:underline flex items-center gap-1"
                    >
                      <span>Watch</span>
                      <Play className="w-3 h-3 fill-[#7E1929]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1F0408] border border-[#D4AF37]/40 rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 bg-[#2C060D] border-b border-[#5A121E] flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">{activeVideo.category}</span>
                <h3 className="font-serif-brand font-bold text-sm sm:text-base text-white">{activeVideo.title}</h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Screen Container */}
            <div className="relative aspect-video bg-black">
              {isEmbeddableVideo(activeVideo.media_url) ? (
                <iframe
                  className="w-full h-full"
                  src={getEmbedUrl(activeVideo.media_url)}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  className="w-full h-full"
                  controls
                  autoPlay
                  src={activeVideo.media_url.startsWith('http') ? activeVideo.media_url : `${activeVideo.media_url}`}
                >
                  Your browser does not support HTML5 video playback.
                </video>
              )}
            </div>

            {/* Modal Footer / Instructor Bio */}
            <div className="p-4 bg-[#2C060D] text-gray-300 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="flex items-center gap-1.5 text-white font-medium">
                <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                <span>Instructor: {activeVideo.instructor}</span>
              </p>
              <span className="text-gray-400 text-[11px]">Duration: {activeVideo.duration}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
