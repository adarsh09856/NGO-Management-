import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        setLoading(true);
        const url = category === 'All' ? '/cms/gallery' : `/cms/gallery?category=${encodeURIComponent(category)}`;
        const res = await api.get(url);
        if (res.data.success) {
          setItems(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, [category]);

  const categories = ['All', 'Stupa Construction', 'Puja & Ceremonies', 'Shedra Life', 'Monastic Arts', 'Community Welfare'];

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-8 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="font-serif-brand font-extrabold text-3xl sm:text-4xl text-[#4A0E17]">
            Photo Gallery
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Witness the sacred construction of the Great Druk Wangyel Peace Stupa, Shedra monastic student life, and Dharma ceremonies in Gelephu, Bhutan.
          </p>
        </div>

        {/* Categories */}
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

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading gallery photos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => setLightboxImage(item)}
                className="group relative h-64 rounded-xl overflow-hidden shadow-md cursor-pointer border border-[#EBE5D8] bg-gray-100"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">{item.category}</span>
                  <h4 className="font-serif-brand font-bold text-xs leading-snug">{item.title}</h4>
                  {item.caption && <p className="text-[10px] text-gray-300 mt-1 line-clamp-2">{item.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-[#D4AF37] text-sm flex items-center gap-1 font-bold"
              >
                <X className="w-5 h-5" /> Close
              </button>
              <img
                src={lightboxImage.image_url}
                alt={lightboxImage.title}
                className="max-h-[75vh] w-auto rounded-lg shadow-2xl object-contain"
              />
              <div className="text-center text-white mt-3 space-y-1">
                <h3 className="font-serif-brand font-bold text-base text-[#D4AF37]">{lightboxImage.title}</h3>
                <p className="text-xs text-gray-300 max-w-lg">{lightboxImage.caption}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
