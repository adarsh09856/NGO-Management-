import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Warehouse, PackagePlus, ArrowLeftRight, AlertTriangle, CheckCircle2,
  Package, Boxes, TrendingUp, TrendingDown, Eye, Edit2, Trash2, Plus,
  RefreshCw, X
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function InventoryDashboard() {
  const { success, error } = useToast();
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'low_stock', 'out_of_stock'
  const [loading, setLoading] = useState(true);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemCode, setItemCode] = useState(`ITM-2026-${String(Math.floor(Math.random() * 900 + 100))}`);
  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [currentStock, setCurrentStock] = useState('50');
  const [minStock, setMinStock] = useState('15');
  const [unitCost, setUnitCost] = useState('350');
  const [unitName, setUnitName] = useState('Pcs');
  const [description, setDescription] = useState('');
  const [submittingItem, setSubmittingItem] = useState(false);

  // Stock In Modal
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState(null);
  const [stockInQty, setStockInQty] = useState(10);
  const [stockInRemarks, setStockInRemarks] = useState('');

  // Edit Item Modal
  const [editingItem, setEditingItem] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('1');
  const [editCurrentStock, setEditCurrentStock] = useState('0');
  const [editMinStock, setEditMinStock] = useState('10');
  const [editUnitCost, setEditUnitCost] = useState('0');
  const [editDescription, setEditDescription] = useState('');
  const [updatingItem, setUpdatingItem] = useState(false);

  // Delete Item State
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Store Configuration Lookups Modal (Categories, Units, Suppliers, Locations)
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupTab, setSetupTab] = useState('categories'); // 'categories' | 'units' | 'suppliers' | 'locations'
  const [categoriesList, setCategoriesList] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [newLookupName, setNewLookupName] = useState('');
  const [newLookupExtra, setNewLookupExtra] = useState(''); // symbol or code or contact
  const [newLookupDesc, setNewLookupDesc] = useState('');

  // Fetch Inventory Dashboard & Items
  async function loadData() {
    try {
      setLoading(true);
      const [dashRes, itemsRes] = await Promise.all([
        api.get('/inventory/dashboard'),
        api.get(`/inventory/items?tab=${activeTab}`)
      ]);
      if (dashRes.data.success) setData(dashRes.data.data);
      if (itemsRes.data.success) setItems(itemsRes.data.data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const stats = data?.stats || {
    totalItems: items.length,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalStockValue: 0,
    stockInThisMonth: 0,
    stockInEntries: 0,
    stockOutThisMonth: 0,
    stockOutEntries: 0,
    stockStatus: { inStock: 0, lowStock: 0, outOfStock: 0 }
  };

  const stockStatusData = [
    { name: 'In Stock', value: stats.stockStatus?.inStock || Math.max(0, items.filter(i => i.current_stock > i.min_stock).length), color: '#10B981' },
    { name: 'Low Stock', value: stats.stockStatus?.lowStock || items.filter(i => i.current_stock <= i.min_stock && i.current_stock > 0).length, color: '#F59E0B' },
    { name: 'Out of Stock', value: stats.stockStatus?.outOfStock || items.filter(i => i.current_stock === 0).length, color: '#EF4444' }
  ];

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      setSubmittingItem(true);
      const res = await api.post('/inventory/items', {
        itemCode,
        itemName,
        categoryId: parseInt(categoryId, 10),
        unitId: 1,
        currentStock: parseFloat(currentStock),
        minStock: parseFloat(minStock),
        unitCost: parseFloat(unitCost),
        description
      });
      if (res.data.success) {
        success('Store item added to inventory!');
        setShowAddModal(false);
        setItemName('');
        setDescription('');
        setItemCode(`ITM-2026-${String(Math.floor(Math.random() * 900 + 100))}`);
        loadData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add item');
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleStockInSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemForStock) return;
    try {
      const res = await api.post('/inventory/stock-in', {
        itemId: selectedItemForStock.id,
        quantity: stockInQty,
        remarks: stockInRemarks || 'Stock replenishment'
      });
      if (res.data.success) {
        success(res.data.message);
        setShowStockInModal(false);
        loadData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Stock In failed');
    }
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setEditItemName(item.item_name || '');
    setEditCategoryId(String(item.category_id || '1'));
    setEditCurrentStock(String(item.current_stock || '0'));
    setEditMinStock(String(item.min_stock || '10'));
    setEditUnitCost(String(item.unit_cost || '0'));
    setEditDescription(item.description || '');
  };

  const handleUpdateItemSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      setUpdatingItem(true);
      const res = await api.put(`/inventory/items/${editingItem.id}`, {
        itemName: editItemName,
        categoryId: parseInt(editCategoryId, 10),
        currentStock: parseFloat(editCurrentStock),
        minStock: parseFloat(editMinStock),
        unitCost: parseFloat(editUnitCost),
        description: editDescription
      });
      if (res.data.success) {
        success('Store item updated successfully');
        setEditingItem(null);
        loadData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update store item');
    } finally {
      setUpdatingItem(false);
    }
  };

  const handleDeleteItemSubmit = async () => {
    if (!deletingItem) return;
    try {
      setIsDeletingItem(true);
      const res = await api.delete(`/inventory/items/${deletingItem.id}`);
      if (res.data.success) {
        success('Store item deleted successfully');
        setDeletingItem(null);
        loadData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete store item');
    } finally {
      setIsDeletingItem(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [cRes, uRes, sRes, lRes] = await Promise.all([
        api.get('/inventory/categories'),
        api.get('/inventory/units'),
        api.get('/inventory/suppliers'),
        api.get('/inventory/locations')
      ]);
      if (cRes.data.success) setCategoriesList(cRes.data.data || []);
      if (uRes.data.success) setUnitsList(uRes.data.data || []);
      if (sRes.data.success) setSuppliersList(sRes.data.data || []);
      if (lRes.data.success) setLocationsList(lRes.data.data || []);
    } catch (err) {
      console.error('Failed to load store lookups:', err);
    }
  };

  const handleOpenSetupModal = () => {
    loadLookups();
    setShowSetupModal(true);
  };

  const handleCreateLookup = async (e) => {
    e.preventDefault();
    try {
      if (setupTab === 'categories') {
        const res = await api.post('/inventory/categories', { name: newLookupName, description: newLookupDesc });
        if (res.data.success) success('Category added');
      } else if (setupTab === 'units') {
        const res = await api.post('/inventory/units', { name: newLookupName, symbol: newLookupExtra || 'Unit' });
        if (res.data.success) success('Measurement unit added');
      } else if (setupTab === 'suppliers') {
        const res = await api.post('/inventory/suppliers', { name: newLookupName, contactPerson: newLookupExtra, address: newLookupDesc });
        if (res.data.success) success('Supplier added');
      } else if (setupTab === 'locations') {
        const res = await api.post('/inventory/locations', { name: newLookupName, code: newLookupExtra || 'LOC', description: newLookupDesc });
        if (res.data.success) success('Store location added');
      }
      setNewLookupName('');
      setNewLookupExtra('');
      setNewLookupDesc('');
      loadLookups();
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleDeleteLookup = async (tab, id) => {
    try {
      const res = await api.delete(`/inventory/${tab}/${id}`);
      if (res.data.success) {
        success('Record deleted successfully');
        loadLookups();
        loadData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete record');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A]">
            Inventory & Store Management
          </h1>
          <p className="text-xs text-gray-500">
            Real-time material balances for Stupa construction and Shedra provisions.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleOpenSetupModal}
            className="px-3.5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
          >
            <Boxes className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Store Configuration</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#E11D48]' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Store Item</span>
          </button>
        </div>
      </div>

      {/* 1. Stat Cards Strip (100% Live Computed from DB) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Items</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">
            {stats.totalItems || items.length}
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Cataloged</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Low Stock Alert</p>
          <h3 className="font-serif-brand font-bold text-lg text-amber-600 mt-1">
            {stats.lowStockItems || 0}
          </h3>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Below Threshold</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Out of Stock</p>
          <h3 className="font-serif-brand font-bold text-lg text-red-600 mt-1">
            {stats.outOfStockItems || 0}
          </h3>
          <p className="text-[10px] text-red-600 font-semibold mt-0.5">Depleted Stock</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Valuation</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">
            ₹ {Number(stats.totalStockValue || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">At Unit Cost</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Stock In (Month)</p>
          <h3 className="font-serif-brand font-bold text-lg text-emerald-700 mt-1">
            ₹ {Number(stats.stockInThisMonth || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">{stats.stockInEntries || 0} Entries</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Stock Out (Month)</p>
          <h3 className="font-serif-brand font-bold text-lg text-red-700 mt-1">
            ₹ {Number(stats.stockOutThisMonth || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">{stats.stockOutEntries || 0} Entries</p>
        </div>
      </div>

      {/* 2. Middle Row: Stock Status Donut & Top Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stock Status Overview */}
        <div className="monastery-card p-5 space-y-3">
          <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">Stock Status Overview</h3>
          <div className="h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stockStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="p-1.5 rounded bg-emerald-50 text-emerald-800 font-bold">
              In Stock ({stockStatusData[0].value})
            </div>
            <div className="p-1.5 rounded bg-amber-50 text-amber-800 font-bold">
              Low Stock ({stockStatusData[1].value})
            </div>
            <div className="p-1.5 rounded bg-red-50 text-red-800 font-bold">
              Out ({stockStatusData[2].value})
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="monastery-card p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">Top Categories</h3>
            <span className="text-[11px] font-bold text-[#BE123C]">Categorized</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {data?.topCategories?.length > 0 ? (
              data.topCategories.slice(0, 5).map((cat) => (
                <div key={cat.id} className="flex justify-between items-center p-1.5 hover:bg-gray-50 rounded">
                  <span className="font-semibold text-gray-800">{cat.name}</span>
                  <span className="font-mono text-gray-500 font-bold">{cat.item_count || 0} Items</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-xs py-4 text-center">Categories syncing with store database</p>
            )}
          </div>
        </div>

        {/* Low Stock Urgent Alerts */}
        <div className="monastery-card p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Low Stock Alerts</span>
            </h3>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Urgent</span>
          </div>
          <div className="space-y-2 text-xs">
            {data?.lowStockAlerts?.length > 0 ? (
              data.lowStockAlerts.map((item) => (
                <div key={item.id} className="p-2 rounded bg-amber-50/70 border border-amber-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{item.item_name}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{item.item_code}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-red-600">{item.current_stock} {item.unit_symbol}</span>
                    <p className="text-[10px] text-gray-400">Min: {item.min_stock}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-emerald-700 bg-emerald-50 rounded">
                All inventory items are currently above minimum stock thresholds.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Items Table */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">Store Items Directory</h3>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono font-bold text-gray-700">
              {items.length} Items
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-gray-100 p-1 rounded-lg text-xs font-semibold">
            {['all', 'low_stock', 'out_of_stock'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded transition-colors capitalize ${
                  activeTab === tab ? 'bg-white shadow text-[#0F172A]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F5F9] text-gray-700 font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Item Code</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Min Stock</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">{item.item_code}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{item.item_name}</td>
                  <td className="py-3 px-4 text-gray-600">{item.category_name || item.category || 'General'}</td>
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">
                    {item.current_stock} {item.unit_symbol || item.unit || 'Pcs'}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500">{item.min_stock}</td>
                  <td className="py-3 px-4 font-mono text-gray-800">₹{parseFloat(item.unit_cost || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                    ₹{((parseFloat(item.current_stock) || 0) * (parseFloat(item.unit_cost) || 0)).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.current_stock === 0 ? 'bg-red-100 text-red-800' :
                      item.current_stock <= item.min_stock ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.current_stock === 0 ? 'Out of Stock' :
                       item.current_stock <= item.min_stock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditItem(item)}
                        title="Edit Item"
                        className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        title="Delete Item"
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setSelectedItemForStock(item); setShowStockInModal(true); }}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1"
                      >
                        <PackagePlus className="w-3 h-3" />
                        <span>Stock In</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Store Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Add New Store Inventory Item
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold"
                  >
                    <option value="1">Stupa Construction Materials</option>
                    <option value="2">Monastic Altar & Puja Supplies</option>
                    <option value="3">Kitchen & Monk Provisions</option>
                    <option value="4">Sacred Arts & Statues</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Pure Mustard Oil for 108 Lamps"
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Current Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Threshold *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Location</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Gelephu Monastery Store Room B"
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingItem}
                  className="px-4 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded font-bold shadow"
                >
                  {submittingItem ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock In Replenishment Modal */}
      {showStockInModal && selectedItemForStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Stock In Replenishment
              </h3>
              <button onClick={() => setShowStockInModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockInSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-bold text-gray-900">{selectedItemForStock.item_name}</p>
                <p className="text-[10px] text-gray-500 font-mono">
                  Code: {selectedItemForStock.item_code} | Current: {selectedItemForStock.current_stock}
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Incoming Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={stockInQty}
                  onChange={(e) => setStockInQty(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Remarks / Supplier Ref</label>
                <input
                  type="text"
                  value={stockInRemarks}
                  onChange={(e) => setStockInRemarks(e.target.value)}
                  placeholder="e.g. Delivery from Phuntsho Traders"
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowStockInModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow"
                >
                  Confirm Stock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Store Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Edit Store Item: {editingItem.item_code}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItemSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 bg-white"
                  >
                    <option value="1">Stupa Construction</option>
                    <option value="2">Monastic Altar & Puja</option>
                    <option value="3">Kitchen & Provisions</option>
                    <option value="4">Sacred Arts & Statues</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editUnitCost}
                    onChange={(e) => setEditUnitCost(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Current Stock Balance</label>
                  <input
                    type="number"
                    value={editCurrentStock}
                    onChange={(e) => setEditCurrentStock(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Threshold Alert</label>
                  <input
                    type="number"
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Location</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingItem}
                  className="px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded font-bold shadow"
                >
                  {updatingItem ? 'Saving...' : 'Update Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Delete Store Item?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-gray-900">{deletingItem.item_name}</span> ({deletingItem.item_code})?
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded mt-2 border border-amber-200 text-left">
                <strong>Audit Rule:</strong> Items with recorded stock transactions cannot be deleted.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={handleDeleteItemSubmit}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs"
              >
                {isDeletingItem ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Configuration Manager Modal (Categories, Units, Suppliers, Locations) */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border p-6 max-w-2xl w-full space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#E11D48]" />
                <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                  Store Master Configuration
                </h3>
              </div>
              <button onClick={() => setShowSetupModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b pb-2 text-xs font-bold">
              {[
                { id: 'categories', label: 'Item Categories', count: categoriesList.length },
                { id: 'units', label: 'Units of Measure', count: unitsList.length },
                { id: 'suppliers', label: 'Registered Suppliers', count: suppliersList.length },
                { id: 'locations', label: 'Store Locations', count: locationsList.length }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSetupTab(t.id)}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    setupTab === t.id ? 'bg-[#0F172A] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>

            {/* Add New Form */}
            <form onSubmit={handleCreateLookup} className="p-3 bg-gray-50 rounded-lg space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  value={newLookupName}
                  onChange={(e) => setNewLookupName(e.target.value)}
                  placeholder={setupTab === 'categories' ? 'Category Name' : setupTab === 'units' ? 'Unit Name' : setupTab === 'suppliers' ? 'Supplier Name' : 'Location Name'}
                  className="p-2 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={newLookupExtra}
                  onChange={(e) => setNewLookupExtra(e.target.value)}
                  placeholder={setupTab === 'units' ? 'Symbol (e.g. Kg, Pcs)' : setupTab === 'locations' ? 'Code (e.g. LOC-01)' : 'Contact / Slug'}
                  className="p-2 rounded border border-gray-300"
                />
                <button
                  type="submit"
                  className="py-2 bg-[#E11D48] text-white rounded font-bold hover:bg-[#BE123C] flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              </div>
            </form>

            {/* List */}
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100 text-xs">
              {setupTab === 'categories' && categoriesList.map(c => (
                <div key={c.id} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900">{c.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono ml-2">slug: {c.slug}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteLookup('categories', c.id)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {setupTab === 'units' && unitsList.map(u => (
                <div key={u.id} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900">{u.name}</span>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono ml-2">{u.symbol}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteLookup('units', u.id)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                    title="Delete Unit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {setupTab === 'suppliers' && suppliersList.map(s => (
                <div key={s.id} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900">{s.name}</span>
                    {s.contact_person && <span className="text-[10px] text-gray-500 ml-2">({s.contact_person})</span>}
                  </div>
                  <button
                    onClick={() => handleDeleteLookup('suppliers', s.id)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                    title="Delete Supplier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {setupTab === 'locations' && locationsList.map(l => (
                <div key={l.id} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900">{l.name}</span>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono ml-2">{l.code}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteLookup('locations', l.id)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                    title="Delete Location"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
