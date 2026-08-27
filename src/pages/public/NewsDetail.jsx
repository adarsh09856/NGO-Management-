import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Eye } from 'lucide-react';
import api from '../../services/api';

export default function NewsDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center py-24 text-gray-500">Loading article...</div>;
  if (!post) return <div className="text-center py-24 text-gray-500">Article not found. <Link to="/news-events" className="text-[#4A0E17] font-bold">Go back</Link></div>;

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-8 bg-[#FDFBF7]">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/news-events" className="inline-flex items-center text-xs font-semibold text-[#8B1E2F] hover:text-[#4A0E17] gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All News & Events</span>
        </Link>

        {/* Hero Image */}
        <div className="relative rounded-xl overflow-hidden shadow-lg border border-[#EBE5D8] max-h-[450px]">
          <img
            src={post.banner_image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200'}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-[#4A0E17] text-[#D4AF37] text-xs font-bold px-3 py-1 rounded shadow">
            {post.category}
          </div>
        </div>

        {/* Post Header */}
        <div className="space-y-3 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[#EBE5D8]">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {post.event_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                {new Date(post.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            )}
            {post.event_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                {post.event_time}
              </span>
            )}
            {post.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                {post.location}
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto text-[11px]">
              <Eye className="w-3.5 h-3.5" />
              {post.views_count} views
            </span>
          </div>

          <h1 className="font-serif-brand font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#4A0E17] leading-tight">
            {post.title}
          </h1>

          {/* Body Content */}
          <div className="pt-6 border-t border-gray-100 text-sm sm:text-base text-gray-700 leading-relaxed space-y-4 whitespace-pre-line">
            {post.content}
          </div>

          {/* Footer Callout */}
          <div className="bg-[#FDF6E2] border-l-4 border-[#D4AF37] p-4 mt-8 rounded text-xs text-[#4A0E17]">
            <p className="font-bold mb-1">Join the Ceremony & Dharma Discourses</p>
            <p className="text-gray-700">For prayer dedications, butter lamp offerings, or monastery inquiries, please contact our administration at <strong>contact@drodulphendeyling.org</strong> or call <strong>+975 17556559</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
