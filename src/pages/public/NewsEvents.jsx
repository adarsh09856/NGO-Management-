import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Tag, ArrowRight, Clock } from 'lucide-react';
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

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="font-serif-brand font-extrabold text-3xl sm:text-4xl text-[#0F172A]">
            News, Teachings & Auspicious Events
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Stay updated with monastery pujas, Shedra Dharma teachings, and construction milestones of the Great Druk Wangyel Peace Stupa.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                category === cat
                  ? 'bg-[#0F172A] text-white shadow'
                  : 'bg-white text-gray-700 border border-[#E2E8F0] hover:border-[#D4AF37]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading events...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(items.length > 0 ? items : [
              { id: 1, slug: 'ganachakra-prayer-ceremony-2026', title: 'Grand Ganachakra Prayer Ceremony', category: 'Ganachakra', event_date: '2026-08-28', event_time: '08:00 AM - 05:00 PM', location: 'Gelephu, Sarpang, Bhutan', banner_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80', summary: 'Annual Guru Rinpoche sacred feast gathering and blessing for global peace and harmony.' },
              { id: 2, slug: 'new-moon-prayer-sep-2026', title: 'New Moon Tara & Prajnaparamita Puja', category: 'Puja', event_date: '2026-09-05', event_time: '06:00 AM - 12:00 PM', location: 'Drodul Phendey Ling Main Hall', banner_image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80', summary: 'Recitation of the Heart Sutra and 21 Praises to Tara for the health and prosperity of all sponsors.' },
              { id: 3, slug: 'teaching-by-khenpo-rinpoche-sep-2026', title: 'Sacred Bodhicitta Teaching by Khenpo Rinpoche', category: 'Teaching', event_date: '2026-09-12', event_time: '02:00 PM - 04:30 PM', location: 'Shedra Assembly Hall, Gelephu', banner_image: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&w=1200&q=80', summary: 'Special discourse on Shantideva\'s Guide to the Bodhisattva Way of Life and cultivating compassion.' },
              { id: 4, slug: 'buddha-dharma-class-online-sep-2026', title: 'Buddha Dharma & Meditation Webinar', category: 'Teaching', event_date: '2026-09-20', event_time: '06:30 PM - 08:00 PM', location: 'Online (Zoom Webinar)', banner_image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80', summary: 'Interactive digital webinar on Tibetan Buddhist meditation fundamentals and mindful daily living.' }
            ]).map(item => (
              <article key={item.id} className="monastery-card overflow-hidden flex flex-col justify-between monastery-card-hover group">
                <div>
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={item.banner_image || 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800'}
                      alt={item.title}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-[#0F172A] text-[#D4AF37] text-[10px] font-bold px-2.5 py-1 rounded shadow">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center space-x-3 text-[11px] text-gray-500">
                      {item.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {new Date(item.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {item.event_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {item.event_time}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif-brand font-bold text-base text-[#0F172A] group-hover:text-[#E11D48] transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {item.summary || item.content}
                    </p>

                    {item.location && (
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{item.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/news-events/${item.slug}`}
                    className="inline-flex items-center text-xs font-bold text-[#BE123C] hover:text-[#0F172A] gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
