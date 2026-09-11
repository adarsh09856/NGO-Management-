import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Clock, Sparkles, Bell, Heart } from 'lucide-react';
import api from '../../services/api';

export default function NewsEvents() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const url = category === 'All' ? '/cms/news-events' : `/cms/news-events?category=${encodeURIComponent(category)}`;
        const res = await api.get(url);
        if (res.data.success) {
          setItems(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load news & events:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [category]);

  const categories = ['All', 'News', 'Teaching', 'Ganachakra', 'Puja'];

  const fallbackItems = [
    {
      id: 1,
      slug: 'ganachakra-prayer-ceremony-2026',
      title: 'Grand Ganachakra Feast Gathering & Universal Peace Puja',
      category: 'Ganachakra',
      event_date: '2026-08-28',
      event_time: '08:00 AM - 05:00 PM',
      location: 'Gelephu Stupa Grounds, Sarpang, Bhutan',
      banner_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
      summary: 'Annual Guru Rinpoche sacred feast gathering and blessing for global peace, environmental healing, and harmony of all sentient beings.'
    },
    {
      id: 2,
      slug: 'new-moon-prayer-sep-2026',
      title: 'Auspicious New Moon 21 Praises to Arya Tara Puja',
      category: 'Puja',
      event_date: '2026-09-05',
      event_time: '06:00 AM - 12:00 PM',
      location: 'Drodul Phendey Ling Main Shrine Hall',
      banner_image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
      summary: 'Recitation of the Heart Sutra and 100,000 Praises to Noble Green Tara for the health, obstacle clearance, and prosperity of all sponsors.'
    },
    {
      id: 3,
      slug: 'teaching-by-khenpo-rinpoche-sep-2026',
      title: 'Discourse on Shantideva’s Bodhicaryavatara by Abbot Khenpo Tashi Dorji',
      category: 'Teaching',
      event_date: '2026-09-12',
      event_time: '02:00 PM - 04:30 PM',
      location: 'Shedra Assembly Hall, Gelephu',
      banner_image: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&w=1200&q=80',
      summary: 'Special weekend transmission on cultivating genuine Bodhicitta and patience in difficult times, open to resident scholars and public devotees.'
    },
    {
      id: 4,
      slug: 'buddha-dharma-class-online-sep-2026',
      title: 'Global Sangha Meditation & Heart Sutra Transmission',
      category: 'Teaching',
      event_date: '2026-09-20',
      event_time: '06:30 PM - 08:00 PM',
      location: 'Online Live Broadcast (Zoom)',
      banner_image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
      summary: 'Live guided Shamatha mindfulness meditation and interactive Q&A directly with senior Lopens of Drodul Phendey Ling Shedra.'
    }
  ];

  const displayItems = items.length > 0 ? items : fallbackItems;

  return (
    <div className="w-full bg-[#FCFBF9] min-h-screen pb-20">
      {/* Luxury Hero Banner */}
      <section className="relative bg-[#1A0B0E] text-white py-12 sm:py-20 px-3 xs:px-4 sm:px-8 overflow-hidden border-b border-[#D4AF37]/30">
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4 sm:space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-serif uppercase tracking-widest backdrop-blur-md">
            <span className="text-sm">☸</span>
            <span className="truncate">༄༅། །དགེ་ལུགས་ཀྱི་མཛད་སྒོ་དང་གསལ་བསྒྲགས། · Ceremonial Gazette</span>
          </div>

          <h1 className="font-editorial text-2xl xs:text-3xl sm:text-5xl lg:text-6xl text-[#FCFBF9] tracking-tight leading-tight break-words">
            Auspicious Ceremonies & Dharma Teachings
          </h1>

          <p className="text-xs sm:text-base text-[#E6D5C3] font-light max-w-2xl mx-auto leading-relaxed">
            Stay aligned with monthly astrological tsog offerings, peace stupa consecrations, and open discourses by Khenpo Tashi Dorji in Gelephu, Bhutan.
          </p>

          {/* Quick Prayer Dedication Link */}
          <div className="pt-2">
            <Link
              to="/prayer-request"
              className="monastic-gold-btn px-6 py-2.5 rounded-full text-xs inline-flex items-center gap-2 shadow-xl"
            >
              <Heart className="w-3.5 h-3.5 fill-[#2A080C]" />
              <span>Dedicate Prayers at Next Ceremony</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-8 mt-8 sm:mt-12 space-y-8 sm:space-y-10">
        {/* Category Filters */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar sm:justify-center border-b border-[#D4AF37]/20">
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-serif font-bold tracking-wider uppercase transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#4A0E17] to-[#721C24] text-[#D4AF37] border border-[#D4AF37] shadow-lg scale-105'
                    : 'bg-white text-gray-700 border border-[#E2E8F0] hover:border-[#D4AF37] hover:text-[#4A0E17]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-24 space-y-3">
            <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-serif text-gray-500 tracking-wider">Gathering ceremonial calendar...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayItems.map((item) => {
              const eventDate = item.event_date ? new Date(item.event_date) : null;
              return (
                <article
                  key={item.id}
                  className="glass-luxury-card overflow-hidden flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 rounded-2xl border border-[#D4AF37]/20"
                >
                  <div>
                    {/* Event Banner & Badge */}
                    <div className="relative h-56 overflow-hidden bg-[#1A0B0E]">
                      <img
                        src={item.banner_image || 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800'}
                        alt={item.title}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B0E]/80 via-transparent to-transparent"></div>

                      {/* Date Emblem */}
                      {eventDate && (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-xl p-2 text-center border border-[#D4AF37]/40 shadow-xl min-w-[54px]">
                          <span className="block text-[10px] uppercase font-bold text-[#721C24] tracking-wider">
                            {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="block text-xl font-editorial font-bold text-[#1A0B0E] leading-none">
                            {eventDate.getDate()}
                          </span>
                        </div>
                      )}

                      <div className="absolute top-4 right-4 bg-[#1A0B0E]/90 text-[#D4AF37] text-[10px] font-serif font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#D4AF37]/50 shadow backdrop-blur-sm">
                        {item.category}
                      </div>
                    </div>

                    {/* Information Body */}
                    <div className="p-6 space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-serif">
                        {item.event_time && (
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {item.event_time}
                          </span>
                        )}
                      </div>

                      <h3 className="font-editorial text-xl text-[#1A0B0E] group-hover:text-[#721C24] transition-colors leading-snug">
                        <Link to={`/news-events/${item.slug}`}>
                          {item.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-light">
                        {item.summary || item.content}
                      </p>

                      {item.location && (
                        <div className="pt-2 flex items-start gap-1.5 text-xs text-gray-500 font-serif">
                          <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="p-6 pt-0 border-t border-gray-100 flex items-center justify-between mt-4">
                    <Link
                      to={`/news-events/${item.slug}`}
                      className="text-xs font-serif font-bold text-[#721C24] hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors group/link"
                    >
                      <span>Ceremony Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover/link:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      to="/prayer-request"
                      className="text-[11px] font-serif text-[#D4AF37] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Offer Puja</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Ceremonial Inscription Callout */}
        <div className="glass-dark-card p-8 sm:p-10 rounded-3xl border border-[#D4AF37]/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 my-16">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[#D4AF37] text-xs font-serif uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
              <Bell className="w-4 h-4" />
              <span>Monastic Calendar Inquiries</span>
            </span>
            <h3 className="font-editorial text-2xl text-[#FCFBF9]">
              Planning to Attend a Ceremony in Gelephu?
            </h3>
            <p className="text-xs text-[#E6D5C3] font-light max-w-xl leading-relaxed">
              Devotees, pilgrims, and guests are always welcome. Please notify our guest coordinator in advance for accommodation and puja arrangements.
            </p>
          </div>
          <Link
            to="/contact"
            className="monastic-gold-btn px-6 py-3 rounded-full text-xs whitespace-nowrap shadow-xl flex-shrink-0"
          >
            Inquire About Attendance
          </Link>
        </div>
      </div>
    </div>
  );
}
