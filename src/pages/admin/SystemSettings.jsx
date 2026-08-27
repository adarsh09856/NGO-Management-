import React, { useState, useEffect } from 'react';
import { Settings, Save, Database, Shield, Globe, CreditCard, Mail, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SystemSettings() {
  const { success, error } = useToast();
  const [settings, setSettings] = useState({
    site_name: 'Drodul Phendey Ling Foundation',
    tax_exempt_reg: 'DPL/TAX-EXEMPT/BTN/2026/80G-092',
    phone: '+975 17556559',
    email: 'contact@drodulphendeyling.org',
    address: 'Great Druk Wangyel Peace Stupa, Gelephu, Sarpang, Bhutan',
    currency: 'INR',
    razorpay_key_id: 'rzp_test_drodulphendeyling_sandbox',
    stripe_publishable_key: 'pk_test_drodulphendeyling_sandbox',
    smtp_host: 'smtp.gmail.com',
    smtp_user: 'donations@drodulphendeyling.org'
  });

  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get('/settings');
        if (res.data.success) {
          setSettings((prev) => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/settings', { settings });
      if (res.data.success) {
        success('System configuration saved successfully!');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDatabaseBackup = async () => {
    try {
      setBackingUp(true);
      const res = await api.post('/settings/backup');
      if (res.data.success) {
        success(`Backup completed! Dump file: ${res.data.data.filename} (${res.data.data.size})`);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Backup failed');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            System Settings & Foundation Configuration
          </h1>
          <p className="text-xs text-gray-500">
            Configure legal tax credentials, payment gateway keys, SMTP, and database backups.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDatabaseBackup}
          disabled={backingUp}
          className="px-4 py-2 bg-[#4A0E17] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
        >
          <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{backingUp ? 'Exporting SQL Dump...' : 'Create Database Backup'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Foundation Profile */}
        <div className="monastery-card p-6 space-y-4">
          <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] border-b pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#D4AF37]" />
            <span>1. Foundation Legal & Tax Registration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Institution Legal Name</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">80G Tax Exemption Reg Number</label>
              <input
                type="text"
                value={settings.tax_exempt_reg}
                onChange={(e) => setSettings({ ...settings, tax_exempt_reg: e.target.value })}
                className="w-full p-2.5 rounded border border-gray-300 font-mono focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Headquarters Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2.5 rounded border border-gray-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Official Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-2.5 rounded border border-gray-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">Monastery Physical Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 rounded border border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="monastery-card p-6 space-y-4">
          <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] border-b pb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#D4AF37]" />
            <span>2. Payment Gateways (Razorpay & Stripe)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Razorpay Key ID</label>
              <input
                type="text"
                value={settings.razorpay_key_id}
                onChange={(e) => setSettings({ ...settings, razorpay_key_id: e.target.value })}
                className="w-full p-2.5 rounded border border-gray-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Stripe Publishable Key</label>
              <input
                type="text"
                value={settings.stripe_publishable_key}
                onChange={(e) => setSettings({ ...settings, stripe_publishable_key: e.target.value })}
                className="w-full p-2.5 rounded border border-gray-300 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded-md font-bold text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
