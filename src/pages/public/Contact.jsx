import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
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
        tags: 'Website Inquiry'
      });

      if (res.data.success) {
        setSubmitted(true);
        success('Thank you. Your message has been received.');
      }
    } catch (err) {
      error('Failed to submit message: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-8 bg-[#F8FAFC] min-h-[80vh]">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="font-serif-brand font-extrabold text-3xl sm:text-4xl text-[#0F172A]">
            Contact Drodul Phendey Ling
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Reach out to our monastic administration, donation desk, or Shedra admissions office.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="monastery-card p-6 space-y-4">
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A] uppercase tracking-wider">
                Monastery Headquarters
              </h3>
              <div className="space-y-3.5 text-xs text-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900">Drodul Phendey Ling Foundation</strong>
                    <span>Great Druk Wangyel Peace Stupa Complex, Gelephu, Sarpang Dzongkhag, Kingdom of Bhutan</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                  <div>
                    <strong className="block text-gray-900">Telephone / WhatsApp:</strong>
                    <span>+975 17556559 / +975 17112233</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                  <div>
                    <strong className="block text-gray-900">Official Inquiries:</strong>
                    <span>contact@drodulphendeyling.org</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                  <div>
                    <strong className="block text-gray-900">Office Hours:</strong>
                    <span>Mon - Sat: 08:00 AM - 05:00 PM (Bhutan Standard Time)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="monastery-card p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-serif-brand font-bold text-xl text-[#0F172A]">Tashi Delek! Message Sent</h3>
                  <p className="text-xs text-gray-600 max-w-sm mx-auto">
                    We have received your message. Our monastery office coordinator will reply shortly.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setMessage(''); }}
                    className="bg-[#0F172A] text-white text-xs font-bold py-2 px-4 rounded"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <h3 className="font-serif-brand font-bold text-base text-[#0F172A] uppercase tracking-wider mb-2">
                    Send An Inquiry
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Maria Wangmo"
                        className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="maria@example.com"
                        className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+975 17 88 1234"
                        className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Stupa Consecration Inquiry"
                        className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Your Message *</label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your inquiry or question for the monastery..."
                      className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-3 rounded-md font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow transition-all"
                  >
                    <Send className="w-4 h-4 text-[#D4AF37]" />
                    <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
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
