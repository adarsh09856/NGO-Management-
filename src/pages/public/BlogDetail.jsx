import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Tag, Share2, Eye, Heart, BookOpen, Clock, Sparkles } from 'lucide-react';
import api from '../../services/api';
import DonationModal from '../../components/DonationModal';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        const res = await api.get(`/blog/${slug}`);
        if (res.data.success) {
          setPost(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load blog post:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FCFBF9]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-serif text-gray-500 tracking-wider">Unrolling the sacred text...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FCFBF9] p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#1A0B0E] border border-[#D4AF37] flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <h2 className="font-editorial text-2xl text-[#1A0B0E]">Sacred Discourse Not Found</h2>
        <p className="text-xs font-serif text-gray-500 max-w-sm">
          The requested monastery journal article could not be retrieved from the archives.
        </p>
        <Link
          to="/blog"
          className="monastic-maroon-btn px-6 py-2.5 rounded-full text-xs inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
          <span>Return to Journal</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FCFBF9] min-h-screen py-8 sm:py-14 px-3 xs:px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-serif font-bold text-[#721C24] hover:text-[#D4AF37] transition-colors truncate"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">← Back to Journal</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D4AF37]/30 text-xs font-serif text-gray-700 hover:border-[#D4AF37] transition-all shadow-sm flex-shrink-0"
          >
            <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Article Container */}
        <article className="glass-luxury-card p-4 xs:p-6 sm:p-12 space-y-6 sm:space-y-8 rounded-2xl sm:rounded-3xl border border-[#D4AF37]/30 shadow-2xl animate-fade-in-up">
          {/* Header Metadata */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap gap-2">
              {post.tags?.split(',').map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1 rounded-full text-[10px] font-serif font-bold bg-[#FAF5F0] text-[#721C24] border border-[#D4AF37]/40 uppercase tracking-widest"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#1A0B0E] leading-tight tracking-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 pb-6 border-b border-[#D4AF37]/20 text-xs font-serif text-gray-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-2 font-bold text-[#1A0B0E]">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                  {post.author_name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  {new Date(post.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-gray-400">
                <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                {post.views_count || 140} contemplations
              </span>
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="rounded-2xl overflow-hidden shadow-xl border border-[#D4AF37]/30 max-h-[480px] bg-[#1A0B0E]">
              <img
                src={post.cover_image}
                alt={post.title}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200'; }}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Rich Content Body */}
          <div
            className="prose prose-lg max-w-none text-[#2A2A2A] font-serif leading-relaxed space-y-6 pt-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Auspicious Merit Offering CTA */}
          <div className="glass-dark-card p-8 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6 border border-[#D4AF37]/40 shadow-2xl">
            <div className="space-y-2 text-center sm:text-left z-10">
              <div className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-serif uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Accumulate Merit</span>
              </div>
              <h3 className="font-editorial text-2xl text-[#FCFBF9]">
                Dedicate Merit to All Sentient Beings
              </h3>
              <p className="text-xs text-[#E6D5C3] max-w-md font-light leading-relaxed">
                Support the monastic education of resident monk scholars and contribute to the Great Druk Wangyel Peace Stupa in Gelephu, Bhutan.
              </p>
            </div>
            <button
              onClick={() => setDonateOpen(true)}
              className="monastic-gold-btn px-6 py-3 rounded-full text-xs flex items-center space-x-2 whitespace-nowrap shadow-xl z-10"
            >
              <Heart className="w-4 h-4 fill-[#2A080C]" />
              <span>Make an Offering</span>
            </button>
          </div>
        </article>

        {/* Related Articles Strip */}
        {post.related && post.related.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-3">
              <span className="text-[#D4AF37] text-lg">☸</span>
              <h3 className="font-editorial text-2xl text-[#1A0B0E]">
                Further Contemplations
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {post.related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="glass-luxury-card p-5 space-y-2.5 block group hover:-translate-y-1 transition-all rounded-xl"
                >
                  <p className="text-[10px] text-[#721C24] font-serif uppercase tracking-wider font-bold">
                    {new Date(rel.published_at).toLocaleDateString()}
                  </p>
                  <h4 className="font-editorial text-base text-[#1A0B0E] group-hover:text-[#721C24] line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 font-light">
                    {rel.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {donateOpen && <DonationModal onClose={() => setDonateOpen(false)} />}
    </div>
  );
}
