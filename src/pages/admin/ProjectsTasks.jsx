import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Plus, CheckCircle2, Clock, Calendar, 
  CheckSquare, Layers, Building2, User, IndianRupee, 
  AlertCircle, ChevronRight, Filter, Search, X
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ProjectsTasks() {
  const { success, error } = useToast();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, in_progress, completed
  const [searchQuery, setSearchQuery] = useState('');

  // Add Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('Dorji Construction Team');
  const [priority, setPriority] = useState('high');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Create Project Modal
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    projectCode: '',
    title: '',
    category: 'Stupa Construction',
    estimatedBudget: '',
    startDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: '',
    location: 'Gelephu, Sarpang Dzongkhag, Bhutan',
    managerName: 'Ugyen Tshering',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, tRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/tasks')
      ]);
      if (pRes.data.success) {
        setProjects(pRes.data.data || []);
        if (pRes.data.data && pRes.data.data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(pRes.data.data[0].id.toString());
        }
      }
      if (tRes.data.success) setTasks(tRes.data.data || []);
    } catch (err) {
      console.error('Failed to load projects/tasks:', err);
      error(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProject,
        estimatedBudget: parseFloat(newProject.estimatedBudget) || 0
      };
      const res = await api.post('/projects', payload);
      if (res.data.success) {
        success('Monastic Project created successfully!');
        setShowProjectModal(false);
        setNewProject({
          projectCode: '',
          title: '',
          category: 'Stupa Construction',
          estimatedBudget: '',
          startDate: new Date().toISOString().split('T')[0],
          targetCompletionDate: '',
          location: 'Gelephu, Sarpang Dzongkhag, Bhutan',
          managerName: 'Ugyen Tshering',
          description: ''
        });
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects/tasks', {
        projectId: parseInt(selectedProjectId, 10),
        title: taskTitle,
        assignedTo,
        priority,
        dueDate: taskDueDate || null,
        status: 'pending'
      });
      if (res.data.success) {
        success('Task added to project board!');
        setShowTaskModal(false);
        setTaskTitle('');
        setTaskDueDate('');
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add task');
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
      const res = await api.put(`/projects/tasks/${taskId}`, { status: nextStatus });
      if (res.data.success) {
        success(`Task marked as ${nextStatus.replace('_', ' ')}`);
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Update failed');
    }
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch = !searchQuery || 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigned_to?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalBudget = projects.reduce((acc, p) => acc + (parseFloat(p.estimated_budget) || 0), 0);
  const totalSpent = projects.reduce((acc, p) => acc + (parseFloat(p.actual_expenditure || p.actual_spent) || 0), 0);
  const activeProjectsCount = projects.filter(p => p.status === 'in_progress' || p.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#090D16] border border-[#2A1E17] p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20">
              <FolderKanban className="w-5 h-5 text-[#E11D48]" />
            </span>
            <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-white">
              Projects & Stupa Construction Milestones
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Monitor engineering milestones, contractor tasks, and sacred stupa site deliverables.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setShowProjectModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-[#D4AF37]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTaskModal(true)}
            className="px-4 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-[#E11D48]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Active Projects</span>
            <span className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{activeProjectsCount}</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">{projects.length} Total Registered Portfolios</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Total Sanctioned Budget</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">₹{totalBudget.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">Capital grants & major devotee pledges</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Total Disbursed To Date</span>
            <span className="p-2 rounded-lg bg-[#E11D48]/10 text-[#E11D48]">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-[#E11D48] mt-2 font-mono">₹{totalSpent.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% budget utilized</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Milestones & Tasks</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <CheckSquare className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{tasks.length}</p>
          <p className="text-[11px] text-emerald-400 mt-1">
            {tasks.filter(t => t.status === 'completed').length} completed ({tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%)
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => {
          const budget = parseFloat(p.estimated_budget || 0);
          const spent = parseFloat(p.actual_expenditure || p.actual_spent || 0);
          const completion = p.completion_percent || (p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0);

          return (
            <div key={p.id} className="bg-[#0D121F] border border-[#2A1E17] hover:border-[#D4AF37]/40 rounded-2xl p-6 space-y-4 shadow-xl transition-all">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase tracking-wider">
                  {p.category || 'Monastic Infrastructure'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  p.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-white/10 text-white border border-white/20'
                }`}>
                  {p.status?.replace('_', ' ') || 'ACTIVE'}
                </span>
              </div>

              <div>
                <h3 className="font-serif-brand font-bold text-base text-white">{p.title}</h3>
                <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{p.description || 'Sacred temple architecture and construction milestone.'}</p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-white/5 text-xs">
                <div className="flex justify-between items-center text-[#94A3B8]">
                  <span>Site Location:</span>
                  <span className="font-semibold text-white truncate max-w-[180px]">{p.location || 'Gelephu, Bhutan'}</span>
                </div>
                <div className="flex justify-between items-center text-[#94A3B8]">
                  <span>Manager:</span>
                  <span className="font-semibold text-white">{p.manager_name || 'Ugyen Tshering'}</span>
                </div>
                <div className="flex justify-between items-center text-[#94A3B8]">
                  <span>Sanctioned Budget:</span>
                  <span className="font-bold text-white font-mono">₹{budget.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-[#94A3B8]">
                  <span>Disbursed:</span>
                  <span className="font-bold text-[#E11D48] font-mono">₹{spent.toLocaleString('en-IN')}</span>
                </div>

                {/* Progress Bar */}
                <div className="pt-1">
                  <div className="flex justify-between text-[11px] font-semibold text-[#94A3B8] mb-1.5">
                    <span>Engineering Progress</span>
                    <span className="text-[#D4AF37] font-mono">{completion}%</span>
                  </div>
                  <div className="w-full bg-[#1E293B] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#D4AF37] to-[#E11D48] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, completion)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tasks Section */}
      <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-serif-brand font-bold text-base text-white">
              Milestone Tasks & Deliverables Register
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Real-time status tracking for stupa carving, gilding, and library framing.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks or contractor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-semibold focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#090D16] text-[#94A3B8] font-bold uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3.5 px-5">Task Description</th>
                <th className="py-3.5 px-4">Monastic Project</th>
                <th className="py-3.5 px-4">Assigned Team / Artisan</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#94A3B8]">
                    No tasks match the active filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-white">{t.title}</div>
                      {t.due_date && (
                        <div className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-[#D4AF37]" />
                          Due: {t.due_date}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#CBD5E1]">{t.project_title || 'General Stupa Work'}</td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">{t.assigned_to || 'Monastery Site Team'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        t.priority === 'high' ? 'bg-[#E11D48]/20 text-[#E11D48] border border-[#E11D48]/30' :
                        t.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        t.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-white/10 text-[#94A3B8] border border-white/10'
                      }`}>
                        {t.status?.replace('_', ' ')?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(t.id, t.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          t.status === 'completed'
                            ? 'bg-white/5 hover:bg-white/10 text-[#94A3B8] border border-white/10'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {t.status === 'completed' ? 'Mark In Progress' : 'Mark Completed'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Building2 className="w-5 h-5" />
                </span>
                <h3 className="font-serif-brand font-bold text-base text-white">
                  Create Monastic Project
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowProjectModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Project Code *</label>
                  <input
                    type="text"
                    required
                    value={newProject.projectCode}
                    onChange={(e) => setNewProject({ ...newProject, projectCode: e.target.value })}
                    placeholder="e.g. PRJ-STUPA-04"
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Category</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Stupa Construction">Stupa Construction</option>
                    <option value="Shedra Expansion">Shedra Expansion</option>
                    <option value="Monastery Renovation">Monastery Renovation</option>
                    <option value="Dharma Event">Dharma Event</option>
                    <option value="Social Welfare">Social Welfare</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Guru Rinpoche Shrine Hall Consecration"
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Sanctioned Budget (INR/BTN) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newProject.estimatedBudget}
                    onChange={(e) => setNewProject({ ...newProject, estimatedBudget: e.target.value })}
                    placeholder="e.g. 5000000"
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Project Manager</label>
                  <input
                    type="text"
                    value={newProject.managerName}
                    onChange={(e) => setNewProject({ ...newProject, managerName: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={newProject.targetCompletionDate}
                    onChange={(e) => setNewProject({ ...newProject, targetCompletionDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Location</label>
                <input
                  type="text"
                  value={newProject.location}
                  onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Description / Scope of Work</label>
                <textarea
                  rows="3"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Details of the sacred project, artisan requirements, and consecration plans..."
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] font-bold rounded-xl shadow-lg transition-all hover:opacity-95"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#E11D48]/10 text-[#E11D48]">
                  <CheckSquare className="w-5 h-5" />
                </span>
                <h3 className="font-serif-brand font-bold text-base text-white">
                  Add Milestone Task
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Select Monastic Project *</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Consecrate Mandala Relics Chamber"
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Assigned Team / Artisan</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl font-bold shadow-lg transition-all"
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
