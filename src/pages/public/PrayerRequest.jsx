import React, { useState } from 'react';
import { Flame, Heart, Shield, CheckCircle2, Sparkles, Send, Calendar, Users } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import DonationModal from '../../components/DonationModal';

export default function PrayerRequest() {
  const { success, error } = useToast();
  const [devoteeName, setDevoteeName] = useState('');
  const [devoteeEmail, setDevoteeEmail] = useState('');
  const [devoteePhone, setDevoteePhone] = useState('');
  const [country, setCountry] = useState('Bhutan');
  const [prayerType, setPrayerType] = useState('World Peace');
  const [intentionText, setIntentionText] = useState('');
  const [butterLampsCount, setButterLampsCount] = useState(108);
  const [dedicationNames, setDedicationNames] = useState('');
  const [offeringAmount, setOfferingAmount] = useState(1500);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!devoteeName || !intentionText) {
      error('Please fill in your name and prayer intention.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/cms/prayer-requests', {
        devoteeName,
        devoteeEmail,
        devoteePhone,
        country,
        prayerType,
        intentionText,
        butterLampsCount,
        dedicationNames,
        offeringAmount
      });

      if (res.data?.success) {
        setSubmitted(true);
        success('Prayer request received with profound gratitude.');
      }
    } catch (err) {
      error('Failed to submit prayer request: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-10 sm:py-16 px-3 xs:px-4 sm:px-8 relative z-10 max-w-4xl mx-auto space-y-8 sm:space-y-12">
      {/* 1. Header Banner */}
      <div className="text-center space-y-3 sm:space-y-4 animate-fade-in-up">
        <div className="inline-flex items-center space-x-2 glow-pill-gold px-3.5 py-1.5 rounded-full text-xs font-bold animate-float">
          <Flame className="w-4 h-4 text-amber-600" />
          <span className="font-tibetan text-sm">༄༅། །མར་མེ་སྨོན་ལམ།</span>
          <span>• Consecrated Sangha Pujas & Butter Lamps</span>
        </div>
        <h1 className="font-serif-brand font-extrabold text-2xl xs:text-3xl sm:text-5xl text-[#0F172A] tracking-wide break-words">
          Sacred Prayer Dedication & Offerings
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto font-light leading-relaxed">
          Our resident monastic Sangha at Drodul Phendey Ling recites daily consecrated prayers and illuminates brass butter lamps before the holy altar for world peace, health, longevity, and obstacle clearance.
        </p>
      </div>

      {submitted ? (
        <div className="glass-panel rounded-3xl shadow-2xl border border-amber-400/50 p-8 sm:p-12 text-center space-y-5 max-w-lg mx-auto animate-fadeIn backdrop-blur-2xl">
          <div className="w-16 h-16 bg-emerald-500/15 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="font-tibetan text-amber-800 text-lg font-bold">
            ༄༅། །བཀྲ་ཤིས་བདེ་ལེགས་ཕུན་སུམ་ཚོགས།
          </div>
          <h3 className="font-serif-brand font-bold text-2xl text-[#0F172A]">Tashi Delek! Prayer Received</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
            Your sacred intention for <strong>{devoteeName}</strong> and offering of <strong>{butterLampsCount} consecrated butter lamps</strong> have been inscribed in the monastic shrine roster.
          </p>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs text-amber-900 font-light">
            Resident monk scholars will chant Tara & Medicine Buddha pujas on the next auspicious auspicious lunar day.
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setDonateOpen(true)}
              className="monastic-maroon-btn text-xs font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
              <span>Offer Dana for this Prayer (₹{offeringAmount.toLocaleString()})</span>
            </button>
            <button
              onClick={() => { setSubmitted(false); setIntentionText(''); setDedicationNames(''); }}
              className="monastic-gold-btn text-xs font-bold py-3 px-6 rounded-full shadow-lg"
            >
              Offer Another Prayer
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-luxury-card rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D4AF37]/30 p-4 xs:p-6 sm:p-10 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Devotee Info */}
            <div className="space-y-4">
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                <span>1. Devotee Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={devoteeName}
                    onChange={(e) => setDevoteeName(e.target.value)}
                    placeholder="e.g. Tashi Dorji"
                    className="glass-input w-full p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#D4AF37]/40"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={devoteeEmail}
                    onChange={(e) => setDevoteeEmail(e.target.value)}
                    placeholder="tashi@example.com"
                    className="glass-input w-full p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#D4AF37]/40"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={devoteePhone}
                    onChange={(e) => setDevoteePhone(e.target.value)}
                    placeholder="+975 17..."
                    className="glass-input w-full p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#D4AF37]/40"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Country / Region</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="glass-input w-full p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#D4AF37]/40"
                  />
                </div>
              </div>
            </div>

            {/* Prayer Details */}
            <div className="space-y-4">
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#721C24]" />
                <span>2. Prayer Category & Dedication</span>
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Type of Puja / Prayer Offering</label>
                  <select
                    value={prayerType}
                    onChange={(e) => setPrayerType(e.target.value)}
                    className="glass-input w-full p-3 rounded-xl text-gray-900 font-semibold"
                  >
                    <option value="World Peace">Global Peace, Harmony & Planetary Healing</option>
                    <option value="Health & Long Life">Health, Healing & Long Life (Medicine Buddha & Amitayus)</option>
                    <option value="Obstacle Clearing">Obstacle Clearance & Protection (21 Noble Taras)</option>
                    <option value="Memorial & Deceased">Memorial Prayers & Bardo Guidance for Departed Loved Ones</option>
                    <option value="Family Prosperity">Family Prosperity, Auspicious Enterprise & Wisdom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Names of Persons to be Dedicated</label>
                  <input
                    type="text"
                    value={dedicationNames}
                    onChange={(e) => setDedicationNames(e.target.value)}
                    placeholder="e.g. Parents, Children, Deceased family members, or specific devotees"
                    className="glass-input w-full p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#D4AF37]/40"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Personal Prayer Intention / Special Words *</label>
                  <textarea
                    rows={4}
                    required
                    value={intentionText}
                    onChange={(e) => setIntentionText(e.target.value)}
                    placeholder="Write your heartfelt wishes, specific prayers, or intentions to be read aloud by the chanting master..."
                    className="glass-input w-full p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#D4AF37]/40"
                  />
                </div>
              </div>
            </div>

            {/* Butter Lamps & Offering */}
            <div className="space-y-4">
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>3. Sacred Butter Lamp Illumination</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { count: 21, amt: 500, label: '21 Lamps (Tara)' },
                  { count: 108, amt: 1500, label: '108 Lamps (Full Mala)' },
                  { count: 500, amt: 5000, label: '500 Lamps (Grand Offering)' },
                  { count: 1000, amt: 10000, label: '1,000 Lamps (Great Merit)' }
                ].map((tier) => (
                  <button
                    key={tier.count}
                    type="button"
                    onClick={() => {
                      setButterLampsCount(tier.count);
                      setOfferingAmount(tier.amt);
                    }}
                    className={`p-4 rounded-2xl text-center border transition-all ${
                      butterLampsCount === tier.count
                        ? 'bg-[#070A12] text-white border-[#D4AF37] shadow-xl scale-105'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-[#D4AF37]'
                    }`}
                  >
                    <Flame className={`w-6 h-6 mx-auto mb-1.5 ${butterLampsCount === tier.count ? 'text-[#D4AF37]' : 'text-amber-500'}`} />
                    <div className="font-bold text-xs">{tier.count} Lamps</div>
                    <div className="text-[11px] text-amber-500 font-bold mt-0.5">₹ {tier.amt.toLocaleString()}</div>
                    <div className="text-[9px] text-gray-400 mt-1">{tier.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full monastic-maroon-btn py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl border border-[#D4AF37]/50"
              >
                <Send className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-serif-brand">
                  {loading ? 'Transmitting Sacred Prayer...' : `SUBMIT PRAYER OFFERING (₹ ${offeringAmount.toLocaleString()})`}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {donateOpen && (
        <DonationModal
          initialAmount={offeringAmount}
          causeTitle="108 Butter Lamp Fund"
          onClose={() => setDonateOpen(false)}
        />
      )}
    </div>
  );
}
