import React, { useState } from 'react';
import { Flame, Heart, Shield, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-[80vh] py-12 px-4 sm:px-8 bg-[#FDFBF7]">
      <div className="max-w-4xl mx-auto">
        {/* Banner */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center space-x-2 bg-[#FDF6E2] text-[#4A0E17] px-4 py-1.5 rounded-full border border-[#D4AF37] text-xs font-semibold">
            <Flame className="w-4 h-4 text-[#D4AF37]" />
            <span>Dedicated Sangha Pujas & Butter Lamps</span>
          </div>
          <h1 className="font-serif-brand font-extrabold text-2xl sm:text-4xl text-[#4A0E17]">
            Sacred Prayer Request & Offerings
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Our monastic Sangha at Drodul Phendey Ling Monastery recites daily prayers and illuminates butter lamps for world peace, longevity, healing, and the well-being of all sentient beings.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-xl shadow-lg border border-[#D4AF37] p-8 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif-brand font-bold text-xl text-[#4A0E17]">Tashi Delek! Prayer Received</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your prayer intention for <strong>{devoteeName}</strong> and <strong>{butterLampsCount} butter lamps</strong> has been placed before the sacred shrine. May boundless merit and peace be yours.
            </p>
            <button
              onClick={() => { setSubmitted(false); setIntentionText(''); }}
              className="bg-[#4A0E17] text-white text-xs font-bold py-2 px-5 rounded-md hover:bg-[#5A121E]"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-[#EBE5D8] p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Devotee Info */}
              <div>
                <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] uppercase tracking-wider mb-3">
                  1. Devotee Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={devoteeName}
                      onChange={(e) => setDevoteeName(e.target.value)}
                      placeholder="e.g. Sonam Dorji"
                      className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={devoteeEmail}
                      onChange={(e) => setDevoteeEmail(e.target.value)}
                      placeholder="sonam@example.com"
                      className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={devoteePhone}
                      onChange={(e) => setDevoteePhone(e.target.value)}
                      placeholder="+975 17556559"
                      className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Prayer Intention */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] uppercase tracking-wider mb-3">
                  2. Sacred Intention & Dedication
                </h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Type of Puja / Prayer *</label>
                    <select
                      value={prayerType}
                      onChange={(e) => setPrayerType(e.target.value)}
                      className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold text-gray-800 focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value="World Peace">Universal World Peace & Harmony</option>
                      <option value="Health & Long Life">Healing, Longevity & Good Health</option>
                      <option value="Departed Loved Ones">Dedication of Merits for Departed Loved Ones</option>
                      <option value="Prosperity">Success in Virtuous Endeavors & Prosperity</option>
                      <option value="Obstacle Removal">Green Tara & Guru Rinpoche Obstacle Clearance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Names of Persons to be Blessed</label>
                    <input
                      type="text"
                      value={dedicationNames}
                      onChange={(e) => setDedicationNames(e.target.value)}
                      placeholder="e.g. Khandu Wangmo, Karma Dorji, All family members"
                      className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Prayer Request & Intention Details *</label>
                    <textarea
                      rows={3}
                      required
                      value={intentionText}
                      onChange={(e) => setIntentionText(e.target.value)}
                      placeholder="Write your prayers, blessings, or special wishes to be read by the Lamas during ceremony..."
                      className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Butter Lamps & Offering */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] uppercase tracking-wider mb-3">
                  3. Butter Lamp Illumination Offering
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Number of Butter Lamps</label>
                    <select
                      value={butterLampsCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value, 10);
                        setButterLampsCount(count);
                        setOfferingAmount(count * 15);
                      }}
                      className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value={21}>21 Butter Lamps (₹315)</option>
                      <option value={108}>108 Butter Lamps (Auspicious Full Altar - ₹1,620)</option>
                      <option value={500}>500 Butter Lamps (₹7,500)</option>
                      <option value={1000}>1,000 Butter Lamps (Grand Illumination - ₹15,000)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Voluntary Offering Amount (INR ₹)</label>
                    <input
                      type="number"
                      value={offeringAmount}
                      onChange={(e) => setOfferingAmount(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 rounded border border-gray-300 font-bold text-emerald-800 focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4A0E17] hover:bg-[#5A121E] text-white py-3.5 px-4 rounded-md font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition-all"
                >
                  <Flame className="w-4 h-4 text-[#D4AF37]" />
                  <span>{loading ? 'Submitting Prayer Request...' : `Submit Prayer Request & Light ${butterLampsCount} Lamps`}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
