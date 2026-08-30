import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Tag, Share2, Eye, Heart, BookOpen, Clock } from 'lucide-react';
import api from '../../services/api';
import DonationModal from '../../components/DonationModal';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#7E1929] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-500">Loading sacred article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FDFBF7] p-6 text-center">
        <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
        <h2 className="font-serif-brand font-bold text-xl text-[#4A0E17]">Article Not Found</h2>
        <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
          The requested monastery journal article could not be found.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4A0E17] text-white rounded-md text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
          <span>Back to Articles</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FDFBF7] min-h-screen py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7E1929] hover:text-[#4A0E17] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
          <span>Back to All Articles</span>
        </Link>

        {/* Article Container */}
        <article className="bg-white rounded-2xl border border-[#EBE5D8] shadow-sm overflow-hidden p-6 sm:p-10 space-y-6">
          {/* Tags & Meta */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {post.tags?.split(',').map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#FAF5F0] text-[#7E1929] border border-[#D4AF37]/30 uppercase tracking-wider"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>

            <h1 className="font-serif-brand font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#4A0E17] leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4 border-b border-gray-100 text-xs text-gray-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1.5 font-semibold text-[#4A0E17]">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                  {post.author_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  {new Date(post.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                <Eye className="w-3.5 h-3.5" />
                {post.views_count} views
              </span>
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="rounded-xl overflow-hidden shadow-md max-h-[440px] bg-gray-100">
              <img
                src={post.cover_image}
                alt={post.title}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'; }}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Rich Content Body */}
          <div
            className="prose prose-sm sm:prose-base max-w-none text-gray-800 font-serif leading-relaxed space-y-4 pt-2"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Bottom Offering / CTA Card */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-[#2C060D] via-[#4A0E17] to-[#1F0408] text-white flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-serif-brand font-bold text-base text-[#D4AF37]">
                Support the Monastery & Stupa Mission
              </h3>
              <p className="text-xs text-gray-300 max-w-md">
                Your generous merit offering helps sustain monk scholars and build the Great Druk Wangyel Peace Stupa.
              </p>
            </div>
            <button
              onClick={() => setDonateOpen(true)}
              className="px-5 py-2.5 bg-[#7E1929] hover:bg-[#8B1E2F] text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-lg border border-[#D4AF37]/50 whitespace-nowrap"
            >
              <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
              <span>Make an Offering</span>
            </button>
          </div>
        </article>

        {/* Related Articles Strip */}
        {post.related && post.related.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-serif-brand font-bold text-lg text-[#4A0E17]">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {post.related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="monastery-card p-4 space-y-2 block monastery-card-hover group"
                >
                  <p className="text-[10px] text-gray-400">{new Date(rel.published_at).toLocaleDateString()}</p>
                  <h4 className="font-serif-brand font-bold text-xs text-[#4A0E17] group-hover:text-[#7E1929] line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                  <p className="text-[11px] text-gray-600 line-clamp-2">
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
