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
    <div className="min-h-[80vh] py-12 px-4 sm:px-8 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="font-serif-brand font-extrabold text-3xl sm:text-4xl text-[#4A0E17]">
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
                  ? 'bg-[#4A0E17] text-white shadow'
                  : 'bg-white text-gray-700 border border-[#EBE5D8] hover:border-[#D4AF37]'
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
            {items.map(item => (
              <article key={item.id} className="monastery-card overflow-hidden flex flex-col justify-between monastery-card-hover group">
                <div>
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={item.banner_image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-[#4A0E17] text-[#D4AF37] text-[10px] font-bold px-2.5 py-1 rounded shadow">
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

                    <h3 className="font-serif-brand font-bold text-base text-[#4A0E17] group-hover:text-[#7E1929] transition-colors leading-snug">
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
                    className="inline-flex items-center text-xs font-bold text-[#8B1E2F] hover:text-[#4A0E17] gap-1 group-hover:translate-x-1 transition-transform"
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
