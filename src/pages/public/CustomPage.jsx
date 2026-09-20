import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Compass, Calendar, Share2, Eye, ShieldAlert, ArrowLeft,
  ChevronRight, ExternalLink, Play, Image as ImageIcon, Sparkles, CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import NotFound from './NotFound';
import SectionEditBadge from '../../components/SectionEditBadge';

export default function CustomPage() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);
  const [copied, setCopied] = useState(false);

  const roleSlug = user?.role?.slug || user?.role_slug;
  const isAuthorized =
    roleSlug === 'super_admin' ||
    roleSlug === 'admin' ||
    roleSlug === 'staff' ||
    roleSlug === 'hr_manager' ||
    roleSlug === 'accountant';

  const fetchPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/pages/${slug}`);
      if (res.data?.success && res.data.page) {
        const p = res.data.page;
        // Parse gallery and social links if returned as string
        if (typeof p.gallery_images === 'string') {
          try { p.gallery_images = JSON.parse(p.gallery_images); } catch (_) { p.gallery_images = []; }
        }
        if (typeof p.social_links === 'string') {
          try { p.social_links = JSON.parse(p.social_links); } catch (_) { p.social_links = {}; }
        }
        if (typeof p.cta_button === 'string') {
          try { p.cta_button = JSON.parse(p.cta_button); } catch (_) { p.cta_button = null; }
        }
        setPage(p);

        // Update Document Title
        document.title = `${p.seo_title || p.title} · Drodul Phendey Ling`;
      } else {
        setError('not_found');
      }
    } catch (err) {
      console.error('Error fetching page:', err);
      setError('not_found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [slug]);

  // Listen for live editor updates
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.slug === slug || !e.detail?.slug) {
        fetchPage();
      }
    };
    window.addEventListener('ngo:page-updated', handleUpdate);
    return () => window.removeEventListener('ngo:page-updated', handleUpdate);
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FCFBF9] py-20 px-4">
        <div className="w-16 h-16 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin mb-4" />
        <p className="text-sm font-serif text-gray-600 animate-pulse">
          ༄༅། ། Consecrating sacred page content...
        </p>
      </div>
    );
  }

  if (error === 'not_found' || !page) {
    return <NotFound />;
  }

  // If page is not published and viewer is not authorized admin
  if (!page.is_published && !isAuthorized) {
    return <NotFound />;
  }

  // Parse video embed URL
  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    const trimmed = url.trim();
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`;
    }
    const vmMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vmMatch && vmMatch[1]) {
      return `https://player.vimeo.com/video/${vmMatch[1]}`;
    }
    if (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm')) {
      return trimmed;
    }
    return null;
  };

  const videoEmbed = getVideoEmbedUrl(page.video_url);
  const gallery = Array.isArray(page.gallery_images) ? page.gallery_images : [];
  const social = page.social_links || {};
  const cta = page.cta_button;

  return (
    <article className="min-h-screen bg-[#FCFBF9] text-[#1F2937] relative pb-24">
      {/* Draft Indicator Ribbon for Logged-In Admin */}
      {!page.is_published && isAuthorized && (
        <div className="bg-amber-500/90 backdrop-blur-md text-slate-950 px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 border-b border-amber-600 sticky top-0 z-30 shadow-md">
          <ShieldAlert className="w-4 h-4 text-slate-950 flex-shrink-0" />
          <span>
            <strong>DRAFT PREVIEW:</strong> This custom page is currently unpublished. Only authenticated administrators can preview this page.
          </span>
          <button
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('ngo:open-live-editor', {
                  detail: {
                    section: 'custom-page',
                    sectionTitle: `Edit Page: ${page.title}`,
                    studioHref: '/admin/pages',
                    customPageData: page
                  }
                })
              );
            }}
            className="ml-3 px-2 py-0.5 rounded bg-slate-950 text-[#D4AF37] text-[11px] font-bold hover:bg-black transition-colors"
          >
            Publish Now
          </button>
        </div>
      )}

      {/* Hero Banner with In-Place Edit Badge */}
      <header className="relative min-h-[340px] sm:min-h-[420px] flex items-end overflow-hidden bg-[#0A0506] border-b border-[#D4AF37]/30">
        {/* Banner Background Image */}
        {page.banner_url ? (
          <img
            src={page.banner_url}
            alt={page.title}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A0B0E] via-[#4A0E17] to-[#0A0506] opacity-90" />
        )}

        {/* Ambient Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0506] via-[#0A0506]/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Admin Live Quick Edit Badge */}
        {isAuthorized && (
          <SectionEditBadge
            sectionKey="custom-page"
            label={`Edit Page: ${page.title}`}
            customPageData={page}
            position="top-6 right-6"
          />
        )}

        {/* Hero Title & Breadcrumb Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-white/70 mb-4 font-serif">
            <Link to="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <Link to="/pages" className="hover:text-[#D4AF37] transition-colors">Pages</Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[#D4AF37] truncate max-w-[200px] sm:max-w-xs">{page.title}</span>
          </nav>

          {/* Tibetan Script Consecration Tag */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#D4AF37] font-serif text-sm">༄༅། །</span>
            {page.category && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F6E05E] border border-[#D4AF37]/40 text-xs font-serif uppercase tracking-widest font-semibold">
                {page.category}
              </span>
            )}
          </div>

          <h1 className="font-editorial font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight mb-4 drop-shadow-md">
            {page.title}
          </h1>

          {page.subtitle && (
            <p className="text-base sm:text-lg text-gray-300 max-w-3xl font-serif font-light leading-relaxed">
              {page.subtitle}
            </p>
          )}

          {/* Social Share & Quick Stats */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-white/10 text-xs text-white/70">
            {page.updated_at && (
              <span className="inline-flex items-center gap-1.5 font-serif">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                Updated {new Date(page.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            )}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-serif transition-colors cursor-pointer border border-white/20"
              title="Copy share link"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-300 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Share Page</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        {/* Narrative Content */}
        {page.content ? (
          <div className="glass-luxury-card p-6 sm:p-10 rounded-3xl border border-[#D4AF37]/20 shadow-xl bg-white/90 backdrop-blur-sm">
            <div className="prose prose-slate prose-lg max-w-none text-gray-700 leading-relaxed font-serif whitespace-pre-line">
              {page.content}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 font-serif italic">
            This consecrated page has no narrative text yet.
          </div>
        )}

        {/* Playable Video Section */}
        {page.video_url && videoEmbed && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-[#721C24]" />
              <h2 className="font-editorial text-xl font-bold text-[#1A0B0E]">
                Multimedia & Dharma Discourse
              </h2>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/40 bg-black aspect-video">
              {videoEmbed.endsWith('.mp4') || videoEmbed.endsWith('.webm') ? (
                <video
                  src={videoEmbed}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={videoEmbed}
                  title={`${page.title} Video Discourse`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          </section>
        )}

        {/* Consecrated Gallery Section */}
        {gallery.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#721C24]" />
                <h2 className="font-editorial text-xl font-bold text-[#1A0B0E]">
                  Sacred Gallery & Visual Archives
                </h2>
              </div>
              <span className="text-xs font-serif text-gray-500 font-medium">
                {gallery.length} Consecrated {gallery.length === 1 ? 'Photograph' : 'Photographs'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveLightboxImg(img)}
                  className="group relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md hover:shadow-xl transition-all cursor-pointer bg-slate-900 aspect-4/3"
                >
                  <img
                    src={img.url}
                    alt={img.caption || `Gallery photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <p className="text-white text-xs font-serif font-medium line-clamp-2">
                      {img.caption || 'Sacred Archival Photograph'}
                    </p>
                    <span className="text-[10px] text-[#D4AF37] font-sans mt-1">
                      Click to view large
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Social Connection Links */}
        {social && Object.keys(social).some((k) => social[k]) && (
          <section className="p-6 rounded-2xl bg-[#FCFBF9] border border-[#D4AF37]/30 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="font-editorial font-bold text-sm text-[#1A0B0E]">
                Connect with this Mandate
              </h3>
              <p className="text-xs text-gray-600 font-serif">
                Follow our consecrated social broadcasts and sacred updates.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
                >
                  Facebook
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-1.5"
                >
                  YouTube
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
                >
                  Instagram
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors inline-flex items-center gap-1.5"
                >
                  X (Twitter)
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
            </div>
          </section>
        )}

        {/* Call To Action Banner */}
        {cta && cta.text && cta.url && (
          <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1A0B0E] via-[#4A0E17] to-[#1A0B0E] border-2 border-[#D4AF37]/50 shadow-2xl text-center text-white space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
            <span className="text-[#D4AF37] text-xl font-serif">༄༅། །</span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight">
              Support this Sacred Endeavor
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto font-serif font-light leading-relaxed">
              Every offering directly supports the monastic scholars, sacred pujas, and perpetual Dharma preservation.
            </p>
            <div className="pt-2">
              <a
                href={cta.url}
                target={cta.url.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                className="monastic-gold-btn px-8 py-3 rounded-full text-xs uppercase tracking-widest font-bold inline-flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform"
              >
                <span>{cta.text}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
              </a>
            </div>
          </section>
        )}

        {/* Return to Sanctuary Link */}
        <div className="pt-8 border-t border-gray-200 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-serif font-semibold text-[#721C24] hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sanctuary Homepage</span>
          </Link>
        </div>
      </main>

      {/* Lightbox Modal for Gallery Photos */}
      {activeLightboxImg && (
        <div
          role="dialog"
          aria-label="Image Lightbox Preview"
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[90vh] flex flex-col items-center cursor-default bg-slate-950 rounded-2xl overflow-hidden border border-[#D4AF37]/40 shadow-2xl"
          >
            <img
              src={activeLightboxImg.url}
              alt={activeLightboxImg.caption || 'Expanded view'}
              className="max-h-[75vh] w-auto object-contain"
            />
            {activeLightboxImg.caption && (
              <div className="p-4 w-full bg-black/80 text-center border-t border-slate-800">
                <p className="text-white text-xs font-serif font-medium">
                  {activeLightboxImg.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
