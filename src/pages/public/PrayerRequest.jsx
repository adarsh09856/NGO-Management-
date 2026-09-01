import React, { useState } from 'react';
import { Flame, Heart, Shield, CheckCircle2, Sparkles, Send } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

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

      if (res.data.success) {
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
    <div className="min-h-[85vh] py-12 px-4 sm:px-8 relative z-10 max-w-4xl mx-auto space-y-10">
      {/* Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 glow-pill-gold px-4 py-1.5 rounded-full text-xs font-bold animate-float">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Dedicated Sangha Pujas & Butter Lamps</span>
        </div>
        <h1 className="font-serif-brand font-extrabold text-2xl sm:text-4xl text-[#4A0E17]">
          Sacred Prayer Request & Offerings
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto font-light leading-relaxed">
          Our monastic Sangha at Drodul Phendey Ling Monastery recites daily prayers and illuminates butter lamps for world peace, longevity, healing, and the well-being of all sentient beings.
        </p>
      </div>

      {submitted ? (
        <div className="glass-panel rounded-3xl shadow-2xl border border-amber-400/50 p-8 sm:p-10 text-center space-y-4 max-w-md mx-auto animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-500/15 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="font-serif-brand font-bold text-xl text-[#4A0E17]">Tashi Delek! Prayer Received</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your prayer intention for <strong>{devoteeName}</strong> and <strong>{butterLampsCount} butter lamps</strong> has been placed before the sacred shrine. May boundless merit and peace be yours.
          </p>
          <button
            onClick={() => { setSubmitted(false); setIntentionText(''); }}
            className="gold-gradient-btn text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-md"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl shadow-2xl border border-white/90 p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Devotee Info */}
            <div>
              <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>1. Devotee Information</span>
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
                    className="glass-input w-full p-2.5 rounded-xl text-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={devoteeEmail}
                    onChange={(e) => setDevoteeEmail(e.target.value)}
                    placeholder="tashi@email.com"
                    className="glass-input w-full p-2.5 rounded-xl text-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={devoteePhone}
                    onChange={(e) => setDevoteePhone(e.target.value)}
                    placeholder="+975 17..."
                    className="glass-input w-full p-2.5 rounded-xl text-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="glass-input w-full p-2.5 rounded-xl text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Prayer Details */}
            <div className="border-t border-gray-200/60 pt-6">
              <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>2. Prayer Category & Dedication</span>
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Type of Prayer Offering</label>
                  <select
                    value={prayerType}
                    onChange={(e) => setPrayerType(e.target.value)}
                    className="glass-input w-full p-2.5 rounded-xl text-gray-900 font-semibold"
                  >
                    <option value="World Peace">Global Peace & Environmental Harmony</option>
                    <option value="Health & Long Life">Health, Healing & Long Life (Amitayus)</option>
                    <option value="Obstacle Clearing">Obstacle Clearance & Protection (Tara)</option>
                    <option value="Memorial & Deceased">Memorial Prayers for Departed Loved Ones</option>
                    <option value="Family Prosperity">Family Prosperity & Auspicious Auspices</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Names to be Dedicated</label>
                  <input
                    type="text"
                    value={dedicationNames}
                    onChange={(e) => setDedicationNames(e.target.value)}
                    placeholder="e.g. Parents, Children, or specific loved one"
                    className="glass-input w-full p-2.5 rounded-xl text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Personal Prayer Intention / Words *</label>
                  <textarea
                    rows={3}
                    required
                    value={intentionText}
                    onChange={(e) => setIntentionText(e.target.value)}
                    placeholder="Write your prayers, wishes, or specific intentions to be recited during morning and evening pujas..."
                    className="glass-input w-full p-2.5 rounded-xl text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Butter Lamps & Offering */}
            <div className="border-t border-gray-200/60 pt-6">
              <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>3. Butter Lamp Illumination</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { count: 21, amt: 500, label: '21 Lamps (Tara)' },
                  { count: 108, amt: 1500, label: '108 Lamps (Full Mala)' },
                  { count: 500, amt: 5000, label: '500 Lamps (Grand)' },
                  { count: 1000, amt: 10000, label: '1,000 Lamps (Great Merit)' }
                ].map((tier) => (
                  <button
                    key={tier.count}
                    type="button"
                    onClick={() => {
                      setButterLampsCount(tier.count);
                      setOfferingAmount(tier.amt);
                    }}
                    className={`p-3 rounded-2xl text-center border transition-all ${
                      butterLampsCount === tier.count
                        ? 'bg-[#4A0E17] text-white border-[#D4AF37] shadow-lg scale-105'
                        : 'bg-white/70 text-gray-800 border-gray-200 hover:border-[#D4AF37]'
                    }`}
                  >
                    <Flame className={`w-5 h-5 mx-auto mb-1 ${butterLampsCount === tier.count ? 'text-[#D4AF37]' : 'text-amber-500'}`} />
                    <div className="font-bold text-xs">{tier.count} Lamps</div>
                    <div className="text-[10px] text-amber-500 font-bold">₹ {tier.amt.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full gold-gradient-btn text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl border border-[#D4AF37]/50"
              >
                <Send className="w-4 h-4 text-[#D4AF37]" />
                <span>{loading ? 'Submitting Prayer...' : `Submit Prayer Offering (₹ ${offeringAmount})`}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
