import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, BookOpen, Clock, Sparkles, Feather } from 'lucide-react';
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

  const fallbackPosts = [
    {
      id: 1,
      slug: 'spiritual-significance-peace-stupa',
      title: 'The Spiritual Significance of Great Druk Wangyel Peace Stupa',
      summary: 'Explore why stupas are regarded as the living mind of the Buddha and how this monument radiates blessings for global peace.',
      cover_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      published_at: '2026-08-20',
      author_name: 'Khenpo Tashi Dorji',
      tags: 'Peace Stupa, Buddhism',
      views_count: 245
    },
    {
      id: 2,
      slug: 'daily-life-shedra-monastic-university',
      title: 'Daily Life in the Shedra: Nurturing Compassion & Wisdom',
      summary: 'A glimpse into the daily schedule, philosophical debates, and meditation practices of our resident monk scholars.',
      cover_image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
      published_at: '2026-08-22',
      author_name: 'Lopen Karma Samten',
      tags: 'Shedra, Monastic Life',
      views_count: 189
    },
    {
      id: 3,
      slug: 'merit-butter-lamp-offerings',
      title: 'The Merit of 108 Butter Lamp Offerings for World Peace',
      summary: 'How the light of butter lamps dispels the darkness of ignorance and generates merit for all sentient beings.',
      cover_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
      published_at: '2026-08-25',
      author_name: 'Dechen Wangmo',
      tags: 'Butter Lamps, Puja',
      views_count: 312
    }
  ];

  const displayPosts = posts.length > 0 ? posts : fallbackPosts;
  const featuredPost = displayPosts[0];
  const gridPosts = displayPosts.slice(1);

  return (
    <div className="w-full bg-[#FCFBF9] min-h-screen pb-20">
      {/* Luxury Hero Header */}
      <section className="relative bg-[#1A0B0E] text-white py-20 px-4 sm:px-8 overflow-hidden border-b border-[#D4AF37]/30">
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#721C24]/30 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-serif uppercase tracking-widest backdrop-blur-md">
            <span className="text-sm">☸</span>
            <span>༄༅། །ཆོས་ཀྱི་བགྲོ་གླེང་དང་དྲན་དེབ། · Wisdom Gazette</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#FCFBF9] tracking-tight leading-tight max-w-4xl mx-auto">
            The Bodhi Path: Sacred Journal & Monastic Chronicles
          </h1>

          <p className="text-sm sm:text-base text-[#E6D5C3] font-light max-w-2xl mx-auto leading-relaxed">
            Spiritual discourses, Buddhist philosophical reflections, and living updates on the Great Druk Wangyel Peace Stupa from Gelephu, Bhutan.
          </p>

          {/* Quick Search in Hero */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-[#D4AF37] absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search sacred teachings, sutras, chronicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm bg-white/10 border border-[#D4AF37]/40 rounded-full text-white placeholder-gray-400 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white/15 transition-all shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-10 space-y-12">
        {/* Category Navigation Pills */}
        <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {allTags.map((tag) => {
              const active = (tag === 'All' && !selectedTag) || selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === 'All' ? '' : tag)}
                  className={`px-4 py-2 rounded-full text-xs font-serif font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-r from-[#4A0E17] to-[#721C24] text-[#D4AF37] border border-[#D4AF37] shadow-md'
                      : 'bg-white text-gray-700 border border-[#E2E8F0] hover:border-[#D4AF37] hover:text-[#4A0E17]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-gray-500 font-serif italic">
            Showing {displayPosts.length} sacred {displayPosts.length === 1 ? 'article' : 'articles'}
          </span>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-24 space-y-3">
            <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-serif text-gray-500 tracking-wider">Unfolding monastery scrolls...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Post Card */}
            {featuredPost && (
              <div className="glass-luxury-card overflow-hidden p-0 border border-[#D4AF37]/30 shadow-2xl rounded-3xl group">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto min-h-[340px] overflow-hidden">
                    <img
                      src={featuredPost.cover_image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200'}
                      alt={featuredPost.title}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-serif font-bold uppercase tracking-widest bg-[#1A0B0E]/90 text-[#D4AF37] border border-[#D4AF37]/50 backdrop-blur-md shadow-lg flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        Featured Contemplation
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between bg-white/80">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-serif">
                        <span className="flex items-center gap-1.5 text-[#721C24] font-semibold">
                          <Calendar className="w-4 h-4 text-[#D4AF37]" />
                          {new Date(featuredPost.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <User className="w-4 h-4 text-[#D4AF37]" />
                          {featuredPost.author_name}
                        </span>
                      </div>

                      <h2 className="font-editorial text-2xl sm:text-3xl text-[#1A0B0E] leading-tight group-hover:text-[#721C24] transition-colors">
                        <Link to={`/blog/${featuredPost.slug}`}>
                          {featuredPost.title}
                        </Link>
                      </h2>

                      <p className="text-sm text-gray-600 leading-relaxed font-light line-clamp-4">
                        {featuredPost.summary}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {featuredPost.tags?.split(',').map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-serif uppercase tracking-wider text-[#721C24] bg-[#FAF5F0] border border-[#D4AF37]/30 px-3 py-1 rounded-full"
                          >
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 mt-6 border-t border-[#E2E8F0] flex items-center justify-between">
                      <Link
                        to={`/blog/${featuredPost.slug}`}
                        className="monastic-maroon-btn px-6 py-2.5 rounded-full text-xs inline-flex items-center gap-2 group/btn"
                      >
                        <span>Read Full Journal</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover/btn:translate-x-1 transition-transform" />
                      </Link>

                      <span className="text-xs text-gray-400 font-serif">
                        {featuredPost.views_count || 120} contemplations
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Grid */}
            {gridPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridPosts.map((post) => (
                  <article
                    key={post.id}
                    className="glass-luxury-card overflow-hidden flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 rounded-2xl"
                  >
                    <div>
                      <div className="relative h-56 overflow-hidden bg-gray-900">
                        <img
                          src={post.cover_image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'}
                          alt={post.title}
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-serif font-bold uppercase tracking-widest bg-[#1A0B0E]/90 text-[#D4AF37] backdrop-blur-sm border border-[#D4AF37]/40 shadow">
                          {post.tags?.split(',')[0] || 'Dharma'}
                        </span>
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="flex items-center space-x-3 text-xs text-gray-500 font-serif">
                          <span className="flex items-center gap-1 text-[#721C24] font-medium">
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {new Date(post.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {post.author_name}
                          </span>
                        </div>

                        <h3 className="font-editorial text-xl text-[#1A0B0E] group-hover:text-[#721C24] transition-colors leading-snug line-clamp-2">
                          <Link to={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h3>

                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-light">
                          {post.summary}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-gray-100 flex items-center justify-between mt-4">
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-xs font-serif font-bold text-[#721C24] hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors group/link"
                      >
                        <span>Contemplate</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover/link:translate-x-1 transition-transform" />
                      </Link>

                      <span className="text-[11px] text-gray-400 font-serif">
                        {post.views_count || 45} views
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Auspicious Tibetan Inscription / Callout Banner */}
        <section className="glass-dark-card p-8 sm:p-12 relative overflow-hidden text-center space-y-4 my-16 border border-[#D4AF37]/40 shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-2xl text-[#D4AF37]">☸</span>
            <blockquote className="font-editorial text-xl sm:text-2xl text-[#FCFBF9] italic leading-relaxed">
              “Just as the great ocean has only one taste, the taste of salt, so also this teaching and discipline has only one taste, the taste of liberation.”
            </blockquote>
            <p className="text-xs font-serif uppercase tracking-widest text-[#D4AF37]">
              — The Buddha (Udana 5.5)
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
