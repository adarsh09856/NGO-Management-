import React, { useState, useEffect } from 'react';
import {
  Compass, Plus, ArrowUp, ArrowDown, Trash2, Edit3, CheckCircle2,
  ExternalLink, Layers, Save, X, AlertCircle, Loader2, Link2, Eye, EyeOff
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function NavigationManager() {
  const { success, error } = useToast();

  const [activeLocation, setActiveLocation] = useState('header');
  const [navData, setNavData] = useState({
    header: [],
    footer_programs: [],
    footer_about: [],
    footer_legal: []
  });
  const [customPages, setCustomPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingReorder, setSavingReorder] = useState(false);

  // Modal State for Add / Edit Link
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    menu_location: 'header',
    label: '',
    url: '',
    is_external: false,
    target_blank: false,
    is_active: true,
    linked_page_id: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Load Navigation and Custom Pages
  const loadData = async () => {
    try {
      setLoading(true);
      const [navRes, pagesRes] = await Promise.all([
        api.get('/navigation?all=true'),
        api.get('/pages?all=true')
      ]);

      if (navRes.data?.success && navRes.data.data) {
        setNavData(navRes.data.data);
      }
      if (pagesRes.data?.success && Array.isArray(pagesRes.data.data)) {
        setCustomPages(pagesRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load navigation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const locationTabs = [
    { key: 'header', label: '1. Header Main Navigation', hint: 'Top navbar links for desktop & mobile menu' },
    { key: 'footer_programs', label: '2. Footer: Sacred Programs', hint: 'First column in the footer grid' },
    { key: 'footer_about', label: '3. Footer: Foundation & About', hint: 'Second column in the footer grid' },
    { key: 'footer_legal', label: '4. Footer: Legal & Policies', hint: 'Statutory legal links in the footer' }
  ];

  const currentItems = navData[activeLocation] || [];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      menu_location: activeLocation,
      label: '',
      url: '',
      is_external: false,
      target_blank: false,
      is_active: true,
      linked_page_id: null
    });
    setModalError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      menu_location: activeLocation,
      label: item.label || '',
      url: item.url || '',
      is_external: Boolean(item.isExternal),
      target_blank: Boolean(item.targetBlank),
      is_active: Boolean(item.isActive),
      linked_page_id: item.linkedPageId || null
    });
    setModalError(null);
    setModalOpen(true);
  };

  // Universal System Page Picker Handler
  const handlePagePickerChange = (e) => {
    const val = e.target.value;
    if (!val) return;

    if (val.startsWith('CUSTOM_PAGE:')) {
      const pageId = parseInt(val.replace('CUSTOM_PAGE:', ''), 10);
      const matched = customPages.find((p) => p.id === pageId);
      if (matched) {
        setForm((prev) => ({
          ...prev,
          label: matched.title,
          url: `/pages/${matched.slug}`,
          linked_page_id: matched.id,
          is_external: false
        }));
      }
    } else if (val.startsWith('CORE:')) {
      const [_, path, label] = val.split(':');
      setForm((prev) => ({
        ...prev,
        label: label || prev.label,
        url: path,
        linked_page_id: null,
        is_external: false
      }));
    }
  };

  // Reordering (Up / Down)
  const handleMove = async (index, direction) => {
    const newItems = [...currentItems];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Update local state immediately for snappy UI
    setNavData((prev) => ({
      ...prev,
      [activeLocation]: newItems
    }));

    // Persist reordered sort_order to backend
    setSavingReorder(true);
    try {
      const payload = newItems.map((item, idx) => ({
        id: item.id,
        sort_order: idx + 1
      }));
      await api.put('/navigation/reorder', { items: payload });
      success('Navigation order saved.');
    } catch (err) {
      error('Failed to update navigation order: ' + (err.response?.data?.message || err.message));
      loadData();
    } finally {
      setSavingReorder(false);
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (item) => {
    try {
      await api.put(`/navigation/${item.id}`, {
        is_active: !item.isActive
      });
      loadData();
    } catch (err) {
      error('Failed to update status.');
    }
  };

  // Delete Link
  const handleDelete = async (id, label) => {
    if (!window.confirm(`Are you sure you want to remove "${label}" from the menu?`)) return;
    try {
      await api.delete(`/navigation/${id}`);
      success('Menu link removed.');
      loadData();
    } catch (err) {
      error('Failed to remove menu link.');
    }
  };

  // Save Modal Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.url.trim()) {
      setModalError('Label and URL path are required.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      if (editingItem) {
        await api.put(`/navigation/${editingItem.id}`, form);
        success('Menu link updated successfully.');
      } else {
        await api.post('/navigation', form);
        success('New menu link added.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save menu link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] p-6 rounded-2xl text-white border border-[#1E293B] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1E293B] border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-md">
            ☸
          </div>
          <div>
            <h1 className="font-serif-brand font-bold text-xl text-white">
              Navigation &amp; Menus Manager
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Curate top header and footer menu links. Connect newly created custom pages with the Universal Page Picker.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#b89528] text-[#0F172A] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Menu Link</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-300 text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Menu Location Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {locationTabs.map((loc) => {
          const isSelected = activeLocation === loc.key;
          const count = (navData[loc.key] || []).length;
          return (
            <button
              key={loc.key}
              type="button"
              onClick={() => setActiveLocation(loc.key)}
              className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#8B2E24] shadow-md ring-1 ring-[#8B2E24]'
                  : 'bg-white/70 border-gray-200 hover:bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isSelected ? 'text-[#8B2E24]' : 'text-gray-800'}`}>
                  {loc.label}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">
                  {count} links
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">{loc.hint}</p>
            </button>
          );
        })}
      </div>

      {/* Current Menu Items Table & Reorder Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {locationTabs.find((l) => l.key === activeLocation)?.label}
            </h3>
            <p className="text-xs text-gray-500">
              Drag or use Up/Down arrows to control link order in the menu.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3 py-1.5 bg-[#8B2E24] text-white hover:bg-[#a0362b] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#8B2E24]" />
            <span>Loading menu links...</span>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Compass className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500">No links in this menu location yet.</p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="text-xs font-semibold text-[#8B2E24] hover:underline"
            >
              + Add first link to this menu
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {currentItems.map((item, idx) => (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  !item.isActive ? 'bg-gray-50/60 opacity-60' : 'hover:bg-gray-50/80'
                }`}
              >
                {/* Left: Reorder & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0 || savingReorder}
                      onClick={() => handleMove(idx, -1)}
                      className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === currentItems.length - 1 || savingReorder}
                      onClick={() => handleMove(idx, 1)}
                      className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-xs font-mono font-bold text-gray-400 w-6 shrink-0">
                    #{idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {item.label}
                      </span>
                      {item.isExternal ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                          External
                        </span>
                      ) : null}
                      {!item.isActive ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-200 text-gray-600 font-semibold">
                          Hidden
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[11px] font-mono text-gray-500 truncate">
                      {item.url}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title={item.isActive ? 'Hide from public menu' : 'Show in public menu'}
                  >
                    {item.isActive ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Link"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.label)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT NAVIGATION ITEM (UNIVERSAL PAGE PICKER) */}
      {/* ========================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#8B2E24]" />
                <h3 className="text-sm font-bold text-gray-900">
                  {editingItem ? 'Edit Menu Link' : 'Add New Menu Link'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Universal System Page Picker Dropdown */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                  Universal System Page Picker
                </label>
                <p className="text-[11px] text-amber-800/80">
                  Select any existing custom page or core portal page to auto-fill the link:
                </p>
                <select
                  onChange={handlePagePickerChange}
                  defaultValue=""
                  className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                >
                  <option value="" disabled>
                    -- Pick a page to auto-populate --
                  </option>
                  <optgroup label="✨ Dynamic Custom Pages">
                    {customPages.map((cp) => (
                      <option key={cp.id} value={`CUSTOM_PAGE:${cp.id}`}>
                        {cp.title} (/pages/{cp.slug})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="☸ Core Monastic Pages">
                    <option value="CORE:/:Home">Home (/)</option>
                    <option value="CORE:/about:About Us & Mandate">About Us &amp; Mandate (/about)</option>
                    <option value="CORE:/shedra:Shedra Monastic Academy">Shedra Monastic Academy (/shedra)</option>
                    <option value="CORE:/prayer-request:Butter Lamps & Prayers">Butter Lamps &amp; Prayers (/prayer-request)</option>
                    <option value="CORE:/donate:Offer Dana & Banking">Offer Dana &amp; Banking (/donate)</option>
                    <option value="CORE:/contact:Secretariat & Contact">Secretariat &amp; Contact (/contact)</option>
                    <option value="CORE:/tracking:Track Offering UTR">Track Offering (/tracking)</option>
                  </optgroup>
                  <optgroup label="📚 Dharma Content">
                    <option value="CORE:/blog:Sacred Gazette & Articles">Sacred Gazette &amp; Articles (/blog)</option>
                    <option value="CORE:/news-events:Ceremonies & Events">Ceremonies &amp; Events (/news-events)</option>
                    <option value="CORE:/gallery:Photo Archives">Photo Archives (/gallery)</option>
                    <option value="CORE:/learning:Dharma LMS Videos">Dharma LMS Videos (/learning)</option>
                  </optgroup>
                  <optgroup label="👤 User Portals">
                    <option value="CORE:/user:Devotee Portal">Devotee Portal (/user)</option>
                    <option value="CORE:/student:Monk Student Portal">Monk Student Portal (/student)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Menu Location
                </label>
                <select
                  value={form.menu_location}
                  onChange={(e) => setForm({ ...form, menu_location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                >
                  <option value="header">1. Header Main Navigation</option>
                  <option value="footer_programs">2. Footer: Sacred Programs</option>
                  <option value="footer_about">3. Footer: Foundation &amp; About</option>
                  <option value="footer_legal">4. Footer: Legal &amp; Policies</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Link Display Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Shedra Monastic Academy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Destination URL / Route Path <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="e.g. /pages/relics or https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#8B2E24] rounded border-gray-300 focus:ring-[#8B2E24]"
                  />
                  <span className="font-medium">Active (Visible in public navigation)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.target_blank}
                    onChange={(e) => setForm({ ...form, target_blank: e.target.checked })}
                    className="w-4 h-4 text-[#8B2E24] rounded border-gray-300 focus:ring-[#8B2E24]"
                  />
                  <span>Open link in new tab (`target="_blank"`)</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#8B2E24] hover:bg-[#a0362b] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingItem ? 'Save Changes' : 'Add Link'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
