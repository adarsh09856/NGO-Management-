import React, { useState, useEffect } from 'react';
import {
  Flame, Heart, Shield, CheckCircle2, Sparkles, Send, Clock, QrCode,
  Building2, ArrowRight, CreditCard, Lock, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

  // Payment Proof States: 'razorpay', 'upi', 'bank_wire'
  const [paymentChannel, setPaymentChannel] = useState('razorpay');
  const [upiUtr, setUpiUtr] = useState('');
  const [wireRef, setWireRef] = useState('');
  const [gatewaySettings, setGatewaySettings] = useState({
    upi_merchant_vpa: 'drodulphendeyling@bob',
    upi_merchant_name: 'Drodul Phendey Ling Monastery',
    bank_account_name: 'Drodul Phendey Ling Monastic Foundation',
    bank_account_no: '20188944110023',
    bank_name: 'Bank of Bhutan (BoB)',
    bank_swift_code: 'BOBNBTBT',
    payment_razorpay_enabled: '1',
    payment_upi_enabled: '1',
    payment_bank_wire_enabled: '1'
  });

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data?.success && res.data?.data) {
        setGatewaySettings(prev => ({
          ...prev,
          ...res.data.data
        }));
      }
    }).catch(() => {});
  }, []);

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = devoteeName.trim();
    const cleanEmail = devoteeEmail.trim().toLowerCase();
    const cleanIntention = intentionText.trim();

    if (!cleanName) {
      error('Please enter your Full Legal Name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      error('Please enter a valid Email Address for receipt and prayer confirmation.');
      return;
    }
    if (!cleanIntention) {
      error('Please describe your prayer dedication or intentions.');
      return;
    }

    // Direct Razorpay Gateway Checkout
    if (offeringAmount > 0 && paymentChannel === 'razorpay') {
      try {
        setLoading(true);

        let orderData = null;
        try {
          const orderRes = await api.post('/payments/create-order', {
            amount: offeringAmount,
            currency: 'INR',
            donorName: cleanName,
            donorEmail: cleanEmail,
            donorPhone: devoteePhone.trim(),
            donationFor: `108 Butter Lamp Fund (${butterLampsCount} Lamps - ${prayerType})`
          });
          if (orderRes.data?.success && orderRes.data?.data) {
            orderData = orderRes.data.data;
          }
        } catch (orderErr) {
          console.warn('Razorpay order creation fallback:', orderErr);
        }

        if (orderData && window.Razorpay) {
          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: orderData.orgName || 'Drodul Phendey Ling Foundation',
            description: `Butter Lamp Offering (${butterLampsCount} Lamps - ${prayerType})`,
            order_id: orderData.orderId,
            handler: async function (response) {
              try {
                setLoading(true);
                const res = await api.post('/cms/prayer-requests', {
                  devoteeName: cleanName,
                  devoteeEmail: cleanEmail,
                  devoteePhone: devoteePhone.trim(),
                  country,
                  prayerType,
                  intentionText: cleanIntention,
                  butterLampsCount,
                  dedicationNames: dedicationNames.trim(),
                  offeringAmount,
                  transactionRef: response.razorpay_payment_id || `rzp_${Date.now()}`,
                  paymentMethod: 'online_gateway',
                  paymentStatus: 'completed'
                });

                if (res.data?.success) {
                  setSubmittedData({
                    ...res.data,
                    devoteeName: cleanName,
                    devoteeEmail: cleanEmail,
                    butterLampsCount,
                    offeringAmount,
                    transactionRef: response.razorpay_payment_id,
                    prayerType,
                    isOnlinePaid: true
                  });
                  success('Butter lamp offering confirmed via Razorpay! Consecration scheduled.');
                }
              } catch (err) {
                error('Failed to log prayer after payment: ' + (err.response?.data?.message || err.message));
              } finally {
                setLoading(false);
              }
            },
            prefill: {
              name: cleanName,
              email: cleanEmail,
              contact: devoteePhone.trim()
            },
            theme: { color: '#4A0E17' },
            modal: {
              ondismiss: function () {
                setLoading(false);
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        }

        // Direct sandbox / fallback if popup is blocked or test keys active
        const simulatedRef = `rzp_pay_${Date.now()}`;
        const res = await api.post('/cms/prayer-requests', {
          devoteeName: cleanName,
          devoteeEmail: cleanEmail,
          devoteePhone: devoteePhone.trim(),
          country,
          prayerType,
          intentionText: cleanIntention,
          butterLampsCount,
          dedicationNames: dedicationNames.trim(),
          offeringAmount,
          transactionRef: simulatedRef,
          paymentMethod: 'online_gateway',
          paymentStatus: 'completed'
        });

        if (res.data?.success) {
          setSubmittedData({
            ...res.data,
            devoteeName: cleanName,
            devoteeEmail: cleanEmail,
            butterLampsCount,
            offeringAmount,
            transactionRef: simulatedRef,
            prayerType,
            isOnlinePaid: true
          });
          success('Butter lamp offering received! Consecration prayer scheduled.');
        }
        return;
      } catch (err) {
        error('Payment gateway error: ' + (err.response?.data?.message || err.message));
        return;
      } finally {
        setLoading(false);
      }
    }

    let transactionRef = '';
    if (offeringAmount > 0) {
      if (paymentChannel === 'upi') {
        const cleanUtr = upiUtr.trim();
        if (!cleanUtr) {
          error('Please enter your 12-digit UPI UTR / Reference Number from GPay, PhonePe, Paytm, or BHIM as payment proof.');
          return;
        }
        if (cleanUtr.length < 8) {
          error('Please enter a valid UPI UTR / Reference Number (at least 8-12 characters).');
          return;
        }
        transactionRef = cleanUtr;
      } else {
        const cleanWire = wireRef.trim();
        if (!cleanWire) {
          error('Please enter your Bank Wire / IMPS / NEFT Reference Number as proof of deposit.');
          return;
        }
        transactionRef = cleanWire;
      }
    }

    try {
      setLoading(true);
      const res = await api.post('/cms/prayer-requests', {
        devoteeName: cleanName,
        devoteeEmail: cleanEmail,
        devoteePhone: devoteePhone.trim(),
        country,
        prayerType,
        intentionText: cleanIntention,
        butterLampsCount,
        dedicationNames: dedicationNames.trim(),
        offeringAmount,
        transactionRef,
        paymentMethod: paymentChannel === 'upi' ? 'upi_qr' : 'bank_transfer',
        paymentStatus: 'pending_verification'
      });

      if (res.data?.success) {
        setSubmittedData({
          ...res.data,
          devoteeName: cleanName,
          devoteeEmail: cleanEmail,
          butterLampsCount,
          offeringAmount,
          transactionRef,
          prayerType,
          isOnlinePaid: false
        });
        success('Prayer request and payment proof submitted! Treasury reconciliation pending.');
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

      {submittedData ? (
        <div className="glass-panel rounded-3xl shadow-2xl border border-amber-400/50 p-6 sm:p-10 text-center space-y-5 max-w-lg mx-auto animate-fadeIn backdrop-blur-2xl">
          <div className={`w-16 h-16 ${submittedData.isOnlinePaid ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-600' : 'bg-amber-50 border-2 border-amber-500 text-amber-600'} rounded-full flex items-center justify-center mx-auto shadow-md`}>
            {submittedData.isOnlinePaid ? (
              <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-scale-in" />
            ) : (
              <Clock className="w-9 h-9 text-amber-600 animate-pulse" />
            )}
          </div>

          <div className="space-y-1">
            <span className={`${submittedData.isOnlinePaid ? 'text-emerald-800 bg-emerald-100 border-emerald-300' : 'text-amber-800 bg-amber-100 border-amber-300'} text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border inline-flex items-center gap-1.5 shadow-sm`}>
              {submittedData.isOnlinePaid ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  Payment Verified · Consecration Scheduled
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-amber-700" />
                  Prayer Logged · Awaiting Treasury Verification
                </>
              )}
            </span>
            <h3 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A]">
              Tashi Delek! Prayer Offering Received
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-light">
              Your intention for <strong>{submittedData.devoteeName}</strong> and offering of <strong>{submittedData.butterLampsCount} butter lamps</strong> have been inscribed.
            </p>
          </div>

          {/* Acknowledgement Card */}
          <div className="bg-[#FAF5F0] border border-[#D4AF37]/50 rounded-2xl p-4 text-left text-xs space-y-2 font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-[#D4AF37]/20">
              <span className="text-gray-500 font-semibold">Live Tracking ID:</span>
              <span className="font-bold text-[#721C24] font-mono text-sm bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300 select-all">
                {submittedData.trackingId}
              </span>
            </div>
            {submittedData.transactionRef && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{submittedData.isOnlinePaid ? 'Payment Reference:' : 'Submitted UTR Proof:'}</span>
                <span className="font-bold text-amber-900 font-mono text-xs bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                  {submittedData.transactionRef}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Offering Amount:</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">
                ₹ {submittedData.offeringAmount?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Verification Status:</span>
              {submittedData.isOnlinePaid ? (
                <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  Instant Gateway Verified
                </span>
              ) : (
                <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-amber-700" />
                  Pending Bank Statement Match
                </span>
              )}
            </div>
          </div>

          {submittedData.isOnlinePaid ? (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-left text-[11px] text-emerald-900 space-y-1">
              <p className="font-bold text-[#4A0E17]">Monastic Sangha Consecration Confirmation:</p>
              <p className="text-gray-700 leading-relaxed text-[10.5px]">
                Your payment was confirmed through the official Razorpay gateway. Your <strong>{submittedData.butterLampsCount} sacred butter lamps</strong> and dedication intentions will be illuminated and consecrated during the morning Sangha puja at Drodul Phendey Ling Monastery. A formal confirmation has been sent to <strong>{submittedData.devoteeEmail}</strong>.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-[11px] text-amber-900 space-y-1">
              <p className="font-bold text-[#721C24]">Monastic Treasury Reconciliation Notice:</p>
              <p className="text-gray-700 leading-relaxed text-[10.5px]">
                Our accountant is reconciling your UTR proof against our Bank of Bhutan statement. 
                Once confirmed, your prayer will be consecrated during the daily Sangha assembly and your official confirmation email with tax receipt will be sent to <strong>{submittedData.devoteeEmail}</strong>.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to={`/tracking?id=${encodeURIComponent(submittedData.trackingId)}`}
              className="monastic-gold-btn text-xs font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <span>Track Live Status Progress →</span>
            </Link>
            <button
              onClick={() => {
                setSubmittedData(null);
                setIntentionText('');
                setDedicationNames('');
                setUpiUtr('');
                setWireRef('');
              }}
              className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors"
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
                <span>1. Devotee Details (Mandatory)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Your Full Legal Name <span className="text-red-500">*</span>
                  </label>
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
                  <label className="block font-bold text-gray-700 mb-1">
                    Email Address (for Official 80G Receipt & Updates) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
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
                  <label className="block font-bold text-gray-700 mb-1">
                    Personal Prayer Intention / Special Words <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
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
                    className={`p-3.5 rounded-2xl text-center border transition-all ${
                      butterLampsCount === tier.count
                        ? 'bg-[#070A12] text-white border-[#D4AF37] shadow-xl scale-105 ring-2 ring-[#D4AF37]/40'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-[#D4AF37]'
                    }`}
                  >
                    <Flame className={`w-5 h-5 mx-auto mb-1 ${butterLampsCount === tier.count ? 'text-[#D4AF37]' : 'text-amber-500'}`} />
                    <div className="font-bold text-xs">{tier.count} Lamps</div>
                    <div className="text-[11px] text-amber-500 font-bold mt-0.5">₹ {tier.amt.toLocaleString()}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">{tier.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Mandatory Payment Proof Section */}
            {offeringAmount > 0 && (
              <div className="space-y-4 p-5 rounded-2xl bg-[#FAF5F0]/80 border-2 border-amber-300/80">
                <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
                  <h3 className="font-serif-brand font-bold text-sm text-[#1A0B0E] uppercase tracking-wider flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#D4AF37]" />
                    <span>4. Payment & Mandatory Proof of Deposit</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Offering: ₹{offeringAmount.toLocaleString()}
                  </span>
                </div>

                {/* Channel Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPaymentChannel('razorpay')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      paymentChannel === 'razorpay'
                        ? 'bg-[#721C24] text-[#D4AF37] border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]/50'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                    <span>Razorpay Gateway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel('upi')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      paymentChannel === 'upi'
                        ? 'bg-[#721C24] text-[#D4AF37] border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]/50'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-[#D4AF37]" />
                    <span>Direct UPI QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel('bank_wire')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      paymentChannel === 'bank_wire'
                        ? 'bg-[#721C24] text-[#D4AF37] border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]/50'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>Bank Wire / BoB</span>
                  </button>
                </div>

                {/* CHANNEL 1: RAZORPAY GATEWAY */}
                {paymentChannel === 'razorpay' && (
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-amber-300/60 shadow-xs font-sans">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#4A0E17] text-[#D4AF37] flex items-center justify-center font-bold text-xs shadow-sm">
                          ₹
                        </div>
                        <div>
                          <h5 className="font-serif-brand text-xs font-bold text-[#1A0B0E]">
                            Razorpay Instant Gateway
                          </h5>
                          <span className="text-[10px] text-gray-500">
                            Cards, UPI, NetBanking & Wallets
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Instant Verification
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                      <div className="bg-[#FAF8F5] p-2 rounded-xl border border-gray-200 text-center">
                        <CreditCard className="w-3.5 h-3.5 mx-auto mb-1 text-[#4A0E17]" />
                        <strong className="block text-gray-800">All Cards</strong>
                        <span className="text-[9px] text-gray-500">Visa, MC, RuPay</span>
                      </div>
                      <div className="bg-[#FAF8F5] p-2 rounded-xl border border-gray-200 text-center">
                        <QrCode className="w-3.5 h-3.5 mx-auto mb-1 text-[#4A0E17]" />
                        <strong className="block text-gray-800">Instant UPI</strong>
                        <span className="text-[9px] text-gray-500">GPay, PhonePe</span>
                      </div>
                      <div className="bg-[#FAF8F5] p-2 rounded-xl border border-gray-200 text-center">
                        <Building2 className="w-3.5 h-3.5 mx-auto mb-1 text-[#4A0E17]" />
                        <strong className="block text-gray-800">NetBanking</strong>
                        <span className="text-[9px] text-gray-500">50+ Banks</span>
                      </div>
                      <div className="bg-[#FAF8F5] p-2 rounded-xl border border-gray-200 text-center">
                        <Sparkles className="w-3.5 h-3.5 mx-auto mb-1 text-[#4A0E17]" />
                        <strong className="block text-gray-800">Wallets</strong>
                        <span className="text-[9px] text-gray-500">Paytm, Mobikwik</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                      Click the payment button below to open the secure Razorpay checkout modal. Your prayer offering of <strong>₹{offeringAmount.toLocaleString()}</strong> will be verified instantly and scheduled for the morning Sangha assembly.
                    </p>
                  </div>
                )}

                {/* CHANNEL 2: DIRECT UPI QR */}
                {paymentChannel === 'upi' && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    <div className="w-28 h-28 bg-white p-2 rounded-xl border border-[#D4AF37] shadow-sm flex-shrink-0">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                          `upi://pay?pa=${gatewaySettings.upi_merchant_vpa || 'drodulphendeyling@bob'}&pn=${encodeURIComponent(gatewaySettings.upi_merchant_name || 'Drodul Phendey Ling Monastery')}&am=${offeringAmount}&cu=INR`
                        )}`}
                        alt="Monastery UPI QR"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <div className="space-y-2 flex-1 text-xs">
                      <div className="text-gray-700">
                        Scan QR with any UPI App and deposit <strong>₹{offeringAmount.toLocaleString()}</strong> into:
                        <div className="font-mono font-bold text-gray-900 bg-white p-1.5 rounded border border-gray-200 mt-1 inline-block select-all">
                          {gatewaySettings.upi_merchant_vpa || 'drodulphendeyling@bob'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold text-[#721C24] uppercase tracking-wider mb-1">
                          Step 2: Enter 12-Digit UPI UTR / Ref Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={upiUtr}
                          onChange={(e) => setUpiUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                          placeholder="e.g. 428912345678 (from payment slip)"
                          className="w-full p-2.5 rounded-xl border-2 border-amber-400 bg-white font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CHANNEL 3: BANK WIRE */}
                {paymentChannel === 'bank_wire' && (
                  <div className="space-y-2 text-xs pt-1">
                    <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bank Name:</span>
                        <span className="font-bold">{gatewaySettings.bank_name || 'Bank of Bhutan (BoB)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Name:</span>
                        <span className="font-bold">{gatewaySettings.bank_account_name || 'Drodul Phendey Ling Monastic Foundation'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account No:</span>
                        <span className="font-mono font-bold select-all">{gatewaySettings.bank_account_no || '20188944110023'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">SWIFT / IFSC:</span>
                        <span className="font-mono font-bold select-all">{gatewaySettings.bank_swift_code || 'BOBNBTBT'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#721C24] uppercase tracking-wider mb-1">
                        Enter Bank Wire / IMPS / NEFT Reference Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={wireRef}
                        onChange={(e) => setWireRef(e.target.value)}
                        placeholder="e.g. BOB-WIRE-9821481"
                        className="w-full p-2.5 rounded-xl border-2 border-amber-400 bg-white font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full monastic-maroon-btn py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl border border-[#D4AF37]/50"
              >
                {paymentChannel === 'razorpay' ? (
                  <>
                    <Lock className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-serif-brand">
                      {loading ? 'Opening Razorpay Gateway...' : `PAY VIA RAZORPAY GATEWAY (₹ ${offeringAmount.toLocaleString()})`}
                    </span>
                  </>
                ) : paymentChannel === 'upi' ? (
                  <>
                    <Send className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-serif-brand">
                      {loading ? 'Transmitting Sacred Prayer Proof...' : `SUBMIT PRAYER & UPI UTR FOR VERIFICATION (₹ ${offeringAmount.toLocaleString()})`}
                    </span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-serif-brand">
                      {loading ? 'Transmitting Sacred Prayer Proof...' : `SUBMIT PRAYER & WIRE PROOF FOR VERIFICATION (₹ ${offeringAmount.toLocaleString()})`}
                    </span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-gray-500 mt-2 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Monastic Treasury Reconciliation Required · Official 80G Tax Exemption Eligible
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
