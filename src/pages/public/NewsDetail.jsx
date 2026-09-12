import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Eye, Sparkles, Heart, Bell, X, CheckCircle2, Users, Send } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function NewsDetail() {
  const { slug } = useParams();
  const { success, error } = useToast();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // RSVP Modal States
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [attendingCount, setAttendingCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpConfirmed, setRsvpConfirmed] = useState(false);

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

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) {
      error('Please provide your name and email to register attendance.');
      return;
    }

    try {
      setRsvpSubmitting(true);
      const res = await api.post('/cms/events/rsvp', {
        eventId: post.id,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim().toLowerCase(),
        guestPhone: guestPhone.trim(),
        attendingCount: parseInt(attendingCount, 10) || 1,
        specialRequests: specialRequests.trim()
      });

      if (res.data?.success) {
        setRsvpConfirmed(true);
        success('RSVP confirmed! We look forward to welcoming you to the ceremony.');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit RSVP. Please try again.');
    } finally {
      setRsvpSubmitting(false);
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
              <button
                onClick={() => { setRsvpModalOpen(true); setRsvpConfirmed(false); }}
                className="monastic-gold-btn px-6 py-2.5 rounded-full text-xs inline-flex items-center gap-2 shadow-lg"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>RSVP to Attend Ceremony</span>
              </button>

              <Link
                to="/prayer-request"
                className="px-5 py-2.5 rounded-full text-xs font-serif font-bold text-amber-300 border border-[#D4AF37]/50 hover:bg-white/10 transition-colors inline-flex items-center gap-2"
              >
                <Heart className="w-3.5 h-3.5 fill-[#D4AF37]" />
                <span>Dedicate Butter Lamps</span>
              </Link>

              <Link
                to="/contact"
                className="px-5 py-2.5 rounded-full text-xs font-serif font-bold text-white border border-white/20 hover:border-[#D4AF37] transition-colors"
              >
                Monastery Etiquette
              </Link>
            </div>
          </div>
        </article>
      </div>

      {/* Interactive RSVP Modal */}
      {rsvpModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 xs:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRsvpModalOpen(false);
          }}
        >
          <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D4AF37]/50 overflow-hidden relative animate-scale-in flex flex-col font-serif">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1A0B0E] via-[#4A0E17] to-[#1A0B0E] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#D4AF37]/40">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center">
                  <span className="text-sm text-[#D4AF37]">☸</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] block">
                    Ceremony Attendance Registration
                  </span>
                  <h3 className="font-editorial font-bold text-base sm:text-lg text-white truncate max-w-xs sm:max-w-sm">
                    {post.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setRsvpModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            {rsvpConfirmed ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-editorial text-2xl text-[#1A0B0E]">
                  Tashi Delek! RSVP Confirmed
                </h4>
                <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong>{guestName}</strong>. Your party of {attendingCount} devotee(s) has been registered for this sacred gathering. We look forward to welcoming you in Gelephu.
                </p>
                <button
                  onClick={() => setRsvpModalOpen(false)}
                  className="monastic-gold-btn px-6 py-2 rounded-full text-xs font-bold shadow-md"
                >
                  Close Confirmation
                </button>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Karma Wangdi"
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="devotee@example.com"
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+975 17..."
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Number of Attendees</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={attendingCount}
                      onChange={(e) => setAttendingCount(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-bold text-gray-700 mb-1">Special Requests / Seating Needs</label>
                  <textarea
                    rows="2"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="E.g. elderly devotee seating, dietary notes, or guest house inquiries..."
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={rsvpSubmitting}
                    className="w-full monastic-maroon-btn py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"
                  >
                    <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{rsvpSubmitting ? 'Registering Attendance...' : 'Confirm Ceremony RSVP'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
