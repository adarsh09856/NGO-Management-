import React, { useState, useEffect } from 'react';
import { Globe, Plus, Image, Calendar, Flame, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CMSManager() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('prayers'); // 'prayers', 'news', 'gallery'
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add News Modal
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('Puja');
  const [newsDate, setNewsDate] = useState('2026-09-05');
  const [newsTime, setNewsTime] = useState('08:00 AM - 04:00 PM');
  const [newsLocation, setNewsLocation] = useState('Great Druk Wangyel Peace Stupa Complex');
  const [newsContent, setNewsContent] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, nRes, gRes] = await Promise.all([
        api.get('/cms/prayer-requests'),
        api.get('/cms/news-events'),
        api.get('/cms/gallery')
      ]);
      if (pRes.data.success) setPrayerRequests(pRes.data.data);
      if (nRes.data.success) setNewsList(nRes.data.data);
      if (gRes.data.success) setGalleryList(gRes.data.data);
    } catch (err) {
      console.error('Failed to load CMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDedicatePrayer = async (id) => {
    try {
      const res = await api.put(`/cms/prayer-requests/${id}/status`, { status: 'dedicated' });
      if (res.data.success) {
        success('Prayer marked as dedicated and recited by Sangha!');
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update prayer');
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/cms/news-events', {
        title: newsTitle,
        category: newsCategory,
        eventDate: newsDate,
        eventTime: newsTime,
        location: newsLocation,
        content: newsContent
      });
      if (res.data.success) {
        success('News & Event published to public website!');
        setShowNewsModal(false);
        setNewsTitle('');
        setNewsContent('');
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to publish news');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Website & CMS Content Management
          </h1>
          <p className="text-xs text-gray-500">
            Publish monastery events, update photo galleries, and dedicate devotee prayer requests.
          </p>
        </div>

        {activeTab === 'news' && (
          <button
            type="button"
            onClick={() => setShowNewsModal(true)}
            className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish New Event</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-[#EBE5D8] pb-3">
        <button
          onClick={() => setActiveTab('prayers')}
          className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'prayers' ? 'bg-[#4A0E17] text-white shadow' : 'bg-white text-gray-700 border hover:border-[#D4AF37]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Devotee Prayer Requests ({prayerRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'news' ? 'bg-[#4A0E17] text-white shadow' : 'bg-white text-gray-700 border hover:border-[#D4AF37]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>News & Events ({newsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'gallery' ? 'bg-[#4A0E17] text-white shadow' : 'bg-white text-gray-700 border hover:border-[#D4AF37]'
          }`}
        >
          <Image className="w-3.5 h-3.5" />
          <span>Photo Gallery ({galleryList.length})</span>
        </button>
      </div>

      {/* Tab 1: Prayer Requests */}
      {activeTab === 'prayers' && (
        <div className="monastery-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
                <tr>
                  <th className="py-3 px-4">Devotee Name</th>
                  <th className="py-3 px-4">Prayer Type</th>
                  <th className="py-3 px-4">Intention Details</th>
                  <th className="py-3 px-4">Butter Lamps</th>
                  <th className="py-3 px-4">Offering</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prayerRequests.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      <div>{p.devotee_name}</div>
                      <div className="text-[10px] text-gray-400">{p.country}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#4A0E17]">{p.prayer_type}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs">{p.intention_text}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#D4AF37]">{p.butter_lamps_count} Lamps</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">₹{parseFloat(p.offering_amount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'dedicated' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status !== 'dedicated' && (
                        <button
                          type="button"
                          onClick={() => handleDedicatePrayer(p.id)}
                          className="px-2.5 py-1 bg-[#FDF6E2] hover:bg-[#FDF2E9] text-[#4A0E17] border border-[#D4AF37] rounded font-bold text-[11px]"
                        >
                          Mark Dedicated
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: News & Events */}
      {activeTab === 'news' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {newsList.map((n) => (
            <div key={n.id} className="monastery-card p-4 space-y-2 text-xs">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FDF6E2] text-[#4A0E17] border border-[#D4AF37]">
                {n.category}
              </span>
              <h4 className="font-serif-brand font-bold text-sm text-[#4A0E17]">{n.title}</h4>
              <p className="text-gray-500 text-[11px]">{n.event_date ? new Date(n.event_date).toLocaleDateString('en-GB') : 'Announcement'}</p>
              <p className="text-gray-600 line-clamp-3">{n.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Photo Gallery */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {galleryList.map((g) => (
            <div key={g.id} className="monastery-card overflow-hidden">
              <img src={g.image_url} alt={g.title} className="w-full h-36 object-cover" />
              <div className="p-3">
                <p className="font-bold text-xs text-gray-900 truncate">{g.title}</p>
                <p className="text-[10px] text-gray-500">{g.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add News Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
              Publish News & Auspicious Event
            </h3>

            <form onSubmit={handleCreateNews} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="e.g. Grand Autumn Peace Stupa Puja"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 bg-white font-semibold"
                  >
                    <option value="Puja">Puja / Ceremony</option>
                    <option value="Teaching">Dharma Teaching</option>
                    <option value="Ganachakra">Ganachakra</option>
                    <option value="News">General News</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={newsDate}
                    onChange={(e) => setNewsDate(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Content / Announcement Details *</label>
                <textarea
                  rows={4}
                  required
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  placeholder="Write full ceremony description..."
                  className="w-full p-2.5 rounded border border-gray-300"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewsModal(false)}
                  className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#4A0E17] text-white rounded font-bold hover:bg-[#5A121E]"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
