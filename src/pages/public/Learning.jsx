import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, Search, GraduationCap, Clock, BookOpen, Compass, Flame, Sparkles, Filter, X } from 'lucide-react';
import api from '../../services/api';

export default function Learning() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState(['All', 'Philosophy', 'Meditation', 'Chanting', 'Sutra']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    async function loadMaterials() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        if (searchQuery) params.append('q', searchQuery);

        const res = await api.get(`/learning?${params.toString()}`);
        if (res.data?.success) {
          setMaterials(res.data.data || []);
          if (res.data.categories && res.data.categories.length > 0) {
            setCategories(res.data.categories);
          }
        }
      } catch (err) {
        console.error('Failed to load learning materials:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMaterials();
  }, [selectedCategory, searchQuery]);

  const defaultMaterials = [
    { id: 1, title: 'Introduction to the Four Noble Truths & Eightfold Path', category: 'Philosophy', duration_minutes: 45, level: 'Beginner', instructor: 'Khenpo Tashi Dorji', description: 'Comprehensive exposition of the fundamental teachings of the Buddha on suffering, its origin, cessation, and the path to liberation.', thumbnail_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80', media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 2, title: 'Shamatha Meditation & Calm Abiding Mind Practice', category: 'Meditation', duration_minutes: 60, level: 'Intermediate', instructor: 'Lopen Karma Samten', description: 'Guided mindfulness practice focusing on breath, single-pointed concentration, and overcoming mental agitation.', thumbnail_url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&w=1200&q=80', media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 3, title: 'The Way of the Bodhisattva: Cultivating Compassion', category: 'Philosophy', duration_minutes: 50, level: 'All Levels', instructor: 'Khenpo Tashi Dorji', description: 'Exploring Shantideva\'s classic masterwork on Bodhicitta and transforming everyday difficulties into spiritual strength.', thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80', media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 4, title: 'Sacred Himalayan Monastic Chanting & Tara Mantras', category: 'Chanting', duration_minutes: 35, level: 'Beginner', instructor: 'Shedra Resident Sangha', description: 'Audio-visual recording of the 21 Praises to Arya Tara chanted at the morning temple assembly in Gelephu.', thumbnail_url: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80', media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
  ];

  const displayList = materials.length > 0 ? materials : defaultMaterials;

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
    <div className="w-full min-h-screen py-8 sm:py-16 px-3 xs:px-4 sm:px-8 relative z-10 max-w-7xl mx-auto space-y-8 sm:space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#070A12] via-[#120508] to-[#070A12] rounded-3xl p-6 xs:p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-[#D4AF37]/40 animate-fade-in-up">
        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
          <span className="glow-pill-gold px-3.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
            <span>☸</span> Open Monastic Dharma Education
          </span>
          <h1 className="font-serif-brand font-extrabold text-2xl xs:text-3xl sm:text-5xl text-white tracking-wide leading-tight break-words">
            Learning & Dharma Video Discourses
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
            Explore authentic Tibetan Buddhist teachings, meditation instructions, and philosophical commentaries presented by our revered Khenpos and resident masters in Bhutan.
          </p>
        </div>
      </div>

      {/* Controls: Search & Category Filter Pills */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4 glass-luxury-card p-3 xs:p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-md">
        {/* Category Tabs with horizontal touch scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#070A12] text-[#D4AF37] border border-[#D4AF37]/60 shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-[#0F172A] border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search lectures, masters, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-2 text-xs rounded-xl text-gray-900 focus:ring-2 focus:ring-[#D4AF37]/40 font-serif"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-[#721C24] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading Dharma discourses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayList.map((item) => (
            <div
              key={item.id}
              className="glass-luxury-card overflow-hidden rounded-2xl flex flex-col justify-between group border border-gray-200/80"
            >
              <div>
                <div
                  className="relative aspect-video overflow-hidden bg-gray-950 cursor-pointer"
                  onClick={() => setActiveVideo(item)}
                >
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#070A12]/90 text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-[#D4AF37] ml-0.5" />
                    </div>
                  </div>

                  <span className="absolute top-3 left-3 glow-pill-sapphire px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {item.category}
                  </span>

                  {item.duration_minutes && (
                    <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {item.duration_minutes} mins
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-700 font-bold uppercase tracking-wider">
                      {item.instructor}
                    </span>
                    {item.level && (
                      <span className="glow-pill-gold px-2 py-0.5 rounded text-[10px] font-semibold">
                        {item.level}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] leading-snug group-hover:text-[#721C24] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => setActiveVideo(item)}
                  className="w-full monastic-maroon-btn py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                  <span>WATCH DISCOURSE</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Lightbox Modal */}
      {activeVideo && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 xs:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-gray-950 rounded-2xl overflow-hidden border border-[#D4AF37]/60 shadow-2xl animate-scale-in">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#721C24] transition-colors border border-white/20"
              aria-label="Close lecture"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(activeVideo.media_url)}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-6 bg-[#070A12] text-white space-y-2 border-t border-[#D4AF37]/30">
              <div className="flex items-center gap-3">
                <span className="glow-pill-sapphire px-2.5 py-0.5 rounded text-[10px] font-bold">
                  {activeVideo.category}
                </span>
                <span className="text-xs text-amber-300 font-semibold">
                  Instructor: {activeVideo.instructor}
                </span>
              </div>
              <h2 className="font-serif-brand font-bold text-lg text-white">
                {activeVideo.title}
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                {activeVideo.description}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
