import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ShieldCheck, Compass, Heart, BookOpen, Users } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function Contact() {
  const { success, error } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !message) {
      error('Please fill in required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/crm/contacts', {
        contactType: 'prospect',
        fullName,
        email,
        phone,
        tags: subject ? `Website Inquiry: ${subject}` : 'Website Inquiry'
      });

      if (res.data.success) {
        setSubmitted(true);
        success('Tashi Delek! Your message has been received by our monastery office.');
      }
    } catch (err) {
      error('Failed to submit message: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    {
      title: "Abbot's Office & Blessings",
      person: "Ven. Khenpo Tashi Dorji",
      desc: "Spiritual consultations, special ceremonial pujas, and private audiences.",
      email: "abbot@drodulphendeyling.org",
      icon: Compass
    },
    {
      title: "Peace Stupa Dana Desk",
      person: "General Secretary / Treasury",
      desc: "Bank wire confirmations, 80G tax exemption receipts, and stupa sponsorship.",
      email: "donations@drodulphendeyling.org",
      icon: Heart
    },
    {
      title: "Shedra Higher Learning",
      person: "Academic Dean (Lopen)",
      desc: "Monk scholar admissions, Buddhist philosophy curriculum, and monastic ordination.",
      email: "shedra@drodulphendeyling.org",
      icon: BookOpen
    },
    {
      title: "Pilgrimage & Guest House",
      person: "Monastery Reception",
      desc: "Visiting hours, devotee accommodation, and peaceful meditation retreat inquiries.",
      email: "visit@drodulphendeyling.org",
      icon: Users
    }
  ];

  return (
    <div className="w-full bg-[#FCFBF9] min-h-screen pb-20">
      {/* Luxury Hero Banner */}
      <section className="relative bg-[#1A0B0E] text-white py-20 px-4 sm:px-8 overflow-hidden border-b border-[#D4AF37]/30">
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-serif uppercase tracking-widest backdrop-blur-md">
            <span className="text-sm">☸</span>
            <span>༄༅། །འབྲེལ་གཏུགས་དང་ཞབས་ཞུ། · Sacred Connection</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#FCFBF9] tracking-tight leading-tight">
            Connect with Drodul Phendey Ling
          </h1>

          <p className="text-sm sm:text-base text-[#E6D5C3] font-light max-w-2xl mx-auto leading-relaxed">
            Reach our Monastic Administration, Shedra Admissions, or Peace Stupa Donation Desk located in the peaceful foothills of Gelephu, Kingdom of Bhutan.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-12 space-y-16">
        {/* Department Directory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dep, idx) => {
            const Icon = dep.icon;
            return (
              <div
                key={idx}
                className="glass-luxury-card p-6 space-y-3 rounded-2xl border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FAF5F0] border border-[#D4AF37]/40 flex items-center justify-center group-hover:bg-[#1A0B0E] transition-colors">
                  <Icon className="w-5 h-5 text-[#721C24] group-hover:text-[#D4AF37] transition-colors" />
                </div>
                <h3 className="font-editorial text-lg text-[#1A0B0E] leading-snug">
                  {dep.title}
                </h3>
                <p className="text-[11px] font-serif font-semibold text-[#721C24]">
                  {dep.person}
                </p>
                <p className="text-xs text-gray-600 font-light leading-relaxed">
                  {dep.desc}
                </p>
                <a
                  href={`mailto:${dep.email}`}
                  className="text-xs font-serif text-[#D4AF37] hover:underline block pt-2 break-all"
                >
                  {dep.email}
                </a>
              </div>
            );
          })}
        </div>

        {/* Main Contact Grid: Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Headquarters Information */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-luxury-card p-8 space-y-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl">
              <div className="space-y-1 border-b border-[#D4AF37]/20 pb-4">
                <span className="text-[10px] font-serif uppercase tracking-widest text-[#721C24] font-bold">
                  Official Monastic Seat
                </span>
                <h2 className="font-editorial text-2xl text-[#1A0B0E]">
                  Monastery Secretariat
                </h2>
              </div>

              <div className="space-y-5 text-xs font-serif text-gray-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF5F0] border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#721C24]" />
                  </div>
                  <div>
                    <strong className="block text-sm text-[#1A0B0E] font-editorial mb-0.5">
                      Drodul Phendey Ling Foundation
                    </strong>
                    <span className="text-gray-600 leading-relaxed block">
                      Great Druk Wangyel Peace Stupa Complex, Gelephu, Sarpang Dzongkhag, Kingdom of Bhutan
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-1">
                      ROB Registered Religious Organization: ROB/CP-04/2021
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF5F0] border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#721C24]" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 font-medium">Telephone & WhatsApp:</strong>
                    <span className="text-gray-600">+975 17556559 / +975 17112233</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF5F0] border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#721C24]" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 font-medium">Official Dispatch:</strong>
                    <span className="text-gray-600">contact@drodulphendeyling.org</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF5F0] border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#721C24]" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 font-medium">Monastery Office Hours:</strong>
                    <span className="text-gray-600">Mon - Sat: 08:00 AM - 05:00 PM (Bhutan Standard Time, UTC+6)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pilgrim Etiquette Box */}
            <div className="glass-dark-card p-6 rounded-2xl border border-[#D4AF37]/40 space-y-3">
              <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-serif uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                <span>Sacred Pilgrim Etiquette</span>
              </div>
              <ul className="text-xs text-[#E6D5C3] font-light space-y-2 list-disc list-inside leading-relaxed">
                <li>Circumambulate (Kora) the Stupa and temples in a clockwise direction.</li>
                <li>Please remove footwear before entering the Main Shrine and Relic Chambers.</li>
                <li>Monastic dress code: Modest attire with shoulders and knees covered is respectful.</li>
                <li>Photography is permitted in outdoor stupa courtyards; kindly avoid flash inside meditation halls.</li>
              </ul>
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="glass-luxury-card p-8 sm:p-12 rounded-3xl border border-[#D4AF37]/30 shadow-2xl">
              {submitted ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-editorial text-2xl text-[#1A0B0E]">
                    Tashi Delek! Inquiry Received
                  </h3>
                  <p className="text-xs font-serif text-gray-600 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out to Drodul Phendey Ling. Our monastery office coordinator will review your message and reply within 24 to 48 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setMessage(''); }}
                    className="monastic-maroon-btn px-6 py-2.5 rounded-full text-xs mt-4"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-serif uppercase tracking-widest text-[#721C24] font-bold">
                      Direct Communication
                    </span>
                    <h3 className="font-editorial text-2xl text-[#1A0B0E]">
                      Send an Inquiry or Dedication Request
                    </h3>
                    <p className="text-xs text-gray-500 font-serif">
                      Your inquiry will be routed directly to the appropriate monastery coordinator.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-serif font-bold text-gray-700 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Tashi Dorji / Maria Smith"
                        className="w-full px-4 py-3 text-xs bg-[#FAF5F0]/60 border border-[#D4AF37]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-serif font-bold text-gray-700 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. devotee@example.com"
                        className="w-full px-4 py-3 text-xs bg-[#FAF5F0]/60 border border-[#D4AF37]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all font-serif"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-serif font-bold text-gray-700 mb-1.5">
                        Phone Number / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +975 17 55 6559"
                        className="w-full px-4 py-3 text-xs bg-[#FAF5F0]/60 border border-[#D4AF37]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-serif font-bold text-gray-700 mb-1.5">
                        Subject / Topic
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Stupa Dedication / Shedra Query"
                        className="w-full px-4 py-3 text-xs bg-[#FAF5F0]/60 border border-[#D4AF37]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all font-serif"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-serif font-bold text-gray-700 mb-1.5">
                      Your Message or Dedication Intention *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please convey your message, prayer dedication request, or questions for the abbot and administration..."
                      className="w-full p-4 text-xs bg-[#FAF5F0]/60 border border-[#D4AF37]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all font-serif leading-relaxed"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="monastic-maroon-btn w-full py-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl"
                  >
                    <Send className="w-4 h-4 text-[#D4AF37]" />
                    <span>{loading ? 'Transmitting Message...' : 'Send Sacred Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
