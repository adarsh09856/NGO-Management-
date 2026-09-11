import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Eye, Sparkles, Heart, Bell } from 'lucide-react';
import api from '../../services/api';

export default function NewsDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const res = await api.get(`/cms/news-events/${slug}`);
        if (res.data.success) {
          setPost(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
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
          <p className="text-xs font-serif text-gray-500 tracking-wider">Unfolding ceremony chronicles...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FCFBF9] p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#1A0B0E] border border-[#D4AF37] flex items-center justify-center">
          <Calendar className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <h2 className="font-editorial text-2xl text-[#1A0B0E]">Ceremony Not Found</h2>
        <p className="text-xs font-serif text-gray-500 max-w-sm">
          The requested ceremony or announcement could not be found in our current calendar.
        </p>
        <Link
          to="/news-events"
          className="monastic-maroon-btn px-6 py-2.5 rounded-full text-xs inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
          <span>Return to Ceremonies</span>
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
            to="/news-events"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-serif font-bold text-[#721C24] hover:text-[#D4AF37] transition-colors truncate"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">← Back to Ceremonies</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D4AF37]/30 text-xs font-serif text-gray-700 hover:border-[#D4AF37] transition-all shadow-sm flex-shrink-0"
          >
            <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Hero Image */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/30 max-h-[480px] bg-[#1A0B0E]">
          <img
            src={post.banner_image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200'}
            alt={post.title}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200'; }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-[#1A0B0E]/90 text-[#D4AF37] text-[10px] sm:text-xs font-serif font-bold uppercase tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-[#D4AF37]/50 shadow-lg backdrop-blur-sm">
            {post.category}
          </div>
        </div>

        {/* Event Card Header */}
        <article className="glass-luxury-card p-4 xs:p-6 sm:p-12 space-y-6 sm:space-y-8 rounded-2xl sm:rounded-3xl border border-[#D4AF37]/30 shadow-xl animate-fade-in-up">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="font-editorial text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-[#1A0B0E] leading-tight tracking-tight break-words">
              {post.title}
            </h1>

            {/* Date / Time / Location Quick Info Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 pb-6 border-y border-[#D4AF37]/20 text-xs font-serif">
              {post.event_date && (
                <div className="flex items-center gap-2.5 text-[#1A0B0E]">
                  <div className="w-8 h-8 rounded-full bg-[#FAF5F0] border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-[#721C24]" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Date</span>
                    <strong className="font-semibold">
                      {new Date(post.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </strong>
                  </div>
                </div>
              )}

              {post.event_time && (
                <div className="flex items-center gap-2.5 text-[#1A0B0E]">
                  <div className="w-8 h-8 rounded-full bg-[#FAF5F0] border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#721C24]" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Time (BST)</span>
                    <strong className="font-semibold">{post.event_time}</strong>
                  </div>
                </div>
              )}

              {post.location && (
                <div className="flex items-center gap-2.5 text-[#1A0B0E]">
                  <div className="w-8 h-8 rounded-full bg-[#FAF5F0] border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#721C24]" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Location</span>
                    <strong className="font-semibold line-clamp-1">{post.location}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="text-base sm:text-lg text-[#2A2A2A] font-serif leading-relaxed space-y-6 pt-2 whitespace-pre-line">
            {post.content}
          </div>

          {/* Auspicious Callout & Prayer Dedication */}
          <div className="glass-dark-card p-6 sm:p-8 rounded-2xl border border-[#D4AF37]/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-serif uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>Devotee Participation</span>
            </div>
            <h3 className="font-editorial text-2xl text-[#FCFBF9]">
              Participate or Dedicate a Puja in Your Family’s Name
            </h3>
            <p className="text-xs text-[#E6D5C3] font-light leading-relaxed">
              If you cannot attend in person, you may request the resident Sangha of Drodul Phendey Ling to recite special prayers and light 108 butter lamps during this sacred gathering.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/prayer-request"
                className="monastic-gold-btn px-6 py-2.5 rounded-full text-xs inline-flex items-center gap-2 shadow-lg"
              >
                <Heart className="w-3.5 h-3.5 fill-[#2A080C]" />
                <span>Dedicate Prayers & Butter Lamps</span>
              </Link>

              <Link
                to="/contact"
                className="px-5 py-2.5 rounded-full text-xs font-serif font-bold text-white border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-colors"
              >
                Monastery Contact & Etiquette
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
