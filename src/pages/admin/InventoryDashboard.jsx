import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Warehouse, PackagePlus, ArrowLeftRight, AlertTriangle, CheckCircle2,
  Package, Boxes, TrendingUp, TrendingDown, Eye, Edit2, Trash2, Plus
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

  // Modal State for Add Item / Stock In / Stock Out
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState(null);
  const [stockInQty, setStockInQty] = useState(10);
  const [stockInRemarks, setStockInRemarks] = useState('');

  // Fetch Inventory Dashboard & Items
  useEffect(() => {
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
    loadData();
  }, [activeTab]);

  const stockStatusData = [
    { name: 'In Stock', value: 296, color: '#059669' },
    { name: 'Low Stock', value: 23, color: '#D97706' },
    { name: 'Out of Stock', value: 7, color: '#DC2626' },
    { name: 'Discontinued', value: 30, color: '#9CA3AF' }
  ];

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
        // Refresh items
        const itemsRes = await api.get(`/inventory/items?tab=${activeTab}`);
        if (itemsRes.data.success) setItems(itemsRes.data.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Stock In failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar (Matching image 3 bottom) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
          Inventory & Store
        </h1>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => success('Stock Transfer workflow initiated')}
            className="px-3.5 py-2 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#7E1929]" />
            <span>Stock Transfer</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* 1. Stat Cards Strip (Matching image 3 bottom) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Items</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">356</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">All Items</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Low Stock Items</p>
          <h3 className="font-serif-brand font-bold text-lg text-amber-600 mt-1">23</h3>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Need Attention</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Out of Stock Items</p>
          <h3 className="font-serif-brand font-bold text-lg text-red-600 mt-1">7</h3>
          <p className="text-[10px] text-red-600 font-semibold mt-0.5">Out of Stock</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Stock Value</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">₹ 8,72,450</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">At Cost Price</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Stock In (This Month)</p>
          <h3 className="font-serif-brand font-bold text-lg text-emerald-700 mt-1">₹ 2,35,600</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">12 Entries</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Stock Out (This Month)</p>
          <h3 className="font-serif-brand font-bold text-lg text-red-700 mt-1">₹ 1,48,900</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">18 Entries</p>
        </div>
      </div>

      {/* 2. Middle Row: Stock Status Donut & Top Categories & Recent Stock In */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stock Status Overview */}
        <div className="monastery-card p-5 space-y-3">
          <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Stock Status Overview</h3>
          <div className="h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stockStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> In Stock (296)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Low Stock (23)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span> Out of Stock (7)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-400"></span> Discontinued (30)</div>
          </div>
        </div>

        {/* Top Categories (Matching image 3 bottom) */}
        <div className="monastery-card p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Top Categories</h3>
            <span className="text-[11px] font-bold text-[#8B1E2F]">View All</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {[
              { name: 'Construction Materials', count: '68 Items' },
              { name: 'Monastery Supplies', count: '54 Items' },
              { name: 'Kitchen & Food Items', count: '46 Items' },
              { name: 'Religious Items', count: '42 Items' },
              { name: 'Stationery & Office', count: '38 Items' }
            ].map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center p-1.5 hover:bg-gray-50 rounded">
                <span className="font-semibold text-gray-800">{cat.name}</span>
                <span className="font-mono text-gray-500">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Stock In (Matching image 3 bottom) */}
        <div className="monastery-card p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Recent Stock In</h3>
            <span className="text-[11px] font-bold text-[#8B1E2F]">View All Stock In</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="p-2 bg-gray-50 rounded flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">Cement (50 Kg) · 100 Bags</p>
                <p className="text-[10px] text-gray-500">Phuntsho Traders · 25 Aug 2026</p>
              </div>
              <p className="font-bold text-emerald-700 font-mono">₹ 32,000</p>
            </div>
            <div className="p-2 bg-gray-50 rounded flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">Butter Lamp (Small) · 200 Pcs</p>
                <p className="text-[10px] text-gray-500">Dorji Supply Co. · 24 Aug 2026</p>
              </div>
              <p className="font-bold text-emerald-700 font-mono">₹ 18,000</p>
            </div>
            <div className="p-2 bg-gray-50 rounded flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">Rice (25 Kg) · 150 Bags</p>
                <p className="text-[10px] text-gray-500">Karma Food Supply · 24 Aug 2026</p>
              </div>
              <p className="font-bold text-emerald-700 font-mono">₹ 22,500</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Items Table with Tabs (Matching image 3 bottom) */}
      <div className="monastery-card overflow-hidden">
        {/* Table Tabs */}
        <div className="p-4 border-b border-[#EBE5D8] flex flex-wrap justify-between items-center gap-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-[#7E1929] text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTab('low_stock')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'low_stock' ? 'bg-[#7E1929] text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low Stock (23)
            </button>
            <button
              onClick={() => setActiveTab('out_of_stock')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'out_of_stock' ? 'bg-[#7E1929] text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Out of Stock (7)
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-3 px-4">Item Code</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Min Stock</th>
                <th className="py-3 px-4">Unit Cost (₹)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#4A0E17]">{item.item_code}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{item.item_name}</td>
                  <td className="py-3 px-4 text-gray-600">{item.category_name}</td>
                  <td className="py-3 px-4 text-gray-500">{item.unit_symbol || item.unit_name}</td>
                  <td className="py-3 px-4 font-mono font-bold text-gray-800">{item.current_stock}</td>
                  <td className="py-3 px-4 font-mono text-gray-500">{item.min_stock}</td>
                  <td className="py-3 px-4 font-mono font-medium">₹{parseFloat(item.unit_cost).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'in_stock' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'low_stock' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status === 'in_stock' ? 'In Stock' : item.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItemForStock(item);
                          setShowStockInModal(true);
                        }}
                        title="Stock In Replenish"
                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => success(`Viewing item ${item.item_name}`)}
                        className="p-1 text-gray-500 hover:text-gray-900 rounded"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => success(`Editing item ${item.item_name}`)}
                        className="p-1 text-blue-600 hover:text-blue-800 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In Quick Modal */}
      {showStockInModal && selectedItemForStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
              Stock In: {selectedItemForStock.item_name}
            </h3>
            <p className="text-xs text-gray-500">Current Stock: {selectedItemForStock.current_stock} {selectedItemForStock.unit_symbol}</p>

            <form onSubmit={handleStockInSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockInQty}
                  onChange={(e) => setStockInQty(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded border border-gray-300 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Remarks / Supplier Ref</label>
                <input
                  type="text"
                  value={stockInRemarks}
                  onChange={(e) => setStockInRemarks(e.target.value)}
                  placeholder="e.g. GRN from Phuntsho Traders"
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStockInModal(false)}
                  className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#4A0E17] text-white rounded font-bold hover:bg-[#5A121E]"
                >
                  Confirm Stock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
