import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, CheckCircle2, Clock, Calendar, CheckSquare, Layers } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ProjectsTasks() {
  const { success, error } = useToast();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('1');
  const [taskTitle, setTaskTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('Dorji Construction Team');
  const [priority, setPriority] = useState('high');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, tRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/tasks')
      ]);
      if (pRes.data.success) setProjects(pRes.data.data);
      if (tRes.data.success) setTasks(tRes.data.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects/tasks', {
        projectId: parseInt(selectedProjectId, 10),
        title: taskTitle,
        assignedTo,
        priority,
        status: 'pending'
      });
      if (res.data.success) {
        success('Task added to project board!');
        setShowTaskModal(false);
        setTaskTitle('');
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add task');
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
      const res = await api.put(`/projects/tasks/${taskId}`, { status: newStatus });
      if (res.data.success) {
        success(`Task marked as ${newStatus}`);
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Projects & Stupa Construction Milestones
          </h1>
          <p className="text-xs text-gray-500">
            Monitor engineering progress, contractor tasks, and site deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTaskModal(true)}
          className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project Task</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <div key={p.id} className="monastery-card p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FDF6E2] text-[#4A0E17] border border-[#D4AF37] uppercase">
                  {p.status?.replace('_', ' ') || 'ACTIVE'}
                </span>
                <h3 className="font-serif-brand font-bold text-base text-[#4A0E17] mt-2">{p.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{p.description}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Budget:</span>
                <span className="font-bold text-gray-900 font-mono">₹{parseFloat(p.estimated_budget).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Spent to Date:</span>
                <span className="font-bold text-red-700 font-mono">₹{parseFloat(p.actual_spent || 0).toLocaleString('en-IN')}</span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                  <span>Construction Progress</span>
                  <span>{p.completion_percent || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#D4AF37] to-[#4A0E17] h-2.5 rounded-full"
                    style={{ width: `${p.completion_percent || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tasks Table */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#EBE5D8] flex justify-between items-center">
          <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">
            Active Tasks & Site Milestones
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{t.title}</td>
                  <td className="py-3 px-4 text-gray-600">{t.project_title}</td>
                  <td className="py-3 px-4 text-gray-700">{t.assigned_to}</td>
                  <td className="py-3 px-4 capitalize">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status?.replace('_', ' ')?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(t.id, t.status)}
                      className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 rounded text-[11px] font-bold"
                    >
                      {t.status === 'completed' ? 'Mark In Progress' : 'Mark Completed'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
              Add Task to Project
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Consecrate Mandala Relics Chamber"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Team</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 bg-white font-semibold"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#4A0E17] text-white rounded font-bold hover:bg-[#5A121E]"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
