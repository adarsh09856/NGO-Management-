import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, Tag, BookOpen, Clock } from 'lucide-react';
import api from '../../services/api';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (selectedTag) params.append('tag', selectedTag);

        const res = await api.get(`/blog?${params.toString()}`);
        if (res.data.success) {
          setPosts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [searchQuery, selectedTag]);

  const allTags = ['All', 'Peace Stupa', 'Buddhism', 'Philosophy', 'Shedra', 'Monastic Life', 'Puja', 'Merit'];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0B0F19] via-[#0F172A] to-[#070A12] rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl border border-[#D4AF37]/30">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="text-[#D4AF37] font-semibold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <span>☸</span> Drodul Phendey Ling Journal
            </span>
            <h1 className="font-serif-brand font-extrabold text-2xl sm:text-4xl text-white tracking-wide">
              Monastery Blog & Wisdom Insights
            </h1>
            <p className="text-xs sm:text-sm text-[#F3F4F6] font-light leading-relaxed">
              Read authentic spiritual articles, peace stupa updates, philosophical reflections, and stories of compassion from the foothills of Gelephu, Bhutan.
            </p>
          </div>
        </div>

        {/* Controls: Search & Tags */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          {/* Tag Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === 'All' ? '' : tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  (tag === 'All' && !selectedTag) || selectedTag === tag
                    ? 'bg-[#0F172A] text-white shadow'
                    : 'bg-[#F1F5F9] text-gray-700 hover:bg-[#FEF3C7] hover:text-[#0F172A]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search articles & stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E11D48] bg-[#FAF9F5]"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading monastery articles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(posts.length > 0 ? posts : [
              { id: 1, slug: 'spiritual-significance-peace-stupa', title: 'The Spiritual Significance of Great Druk Wangyel Peace Stupa', summary: 'Explore why stupas are regarded as the living mind of the Buddha and how this monument radiates blessings for global peace.', cover_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', published_at: '2026-08-20', author_name: 'Khenpo Tashi Dorji', tags: 'Peace Stupa, Buddhism', views_count: 245 },
              { id: 2, slug: 'daily-life-shedra-monastic-university', title: 'Daily Life in the Shedra: Nurturing Compassion & Wisdom', summary: 'A glimpse into the daily schedule, philosophical debates, and meditation practices of our resident monk scholars.', cover_image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80', published_at: '2026-08-22', author_name: 'Lopen Karma Samten', tags: 'Shedra, Monastic Life', views_count: 189 },
              { id: 3, slug: 'merit-butter-lamp-offerings', title: 'The Merit of 108 Butter Lamp Offerings for World Peace', summary: 'How the light of butter lamps dispels the darkness of ignorance and generates merit for all sentient beings.', cover_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80', published_at: '2026-08-25', author_name: 'Dechen Wangmo', tags: 'Butter Lamps, Puja', views_count: 312 }
            ]).map((post) => (
              <article
                key={post.id}
                className="monastery-card overflow-hidden group monastery-card-hover flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden bg-gray-900">
                  <img
                    src={post.cover_image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'}
                    alt={post.title}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0F172A]/90 text-[#D4AF37] backdrop-blur-sm border border-[#D4AF37]/30">
                    {post.tags?.split(',')[0] || 'Dharma'}
                  </span>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {new Date(post.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {post.author_name}
                      </span>
                    </div>

                    <h2 className="font-serif-brand font-bold text-base text-[#0F172A] group-hover:text-[#E11D48] transition-colors leading-snug line-clamp-2">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-xs font-bold text-[#E11D48] hover:text-[#0F172A] flex items-center gap-1 group/link"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover/link:translate-x-1 transition-transform" />
                    </Link>

                    <span className="text-[10px] text-gray-400">
                      {post.views_count} views
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
