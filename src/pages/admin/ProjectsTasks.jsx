import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Plus, CheckCircle2, Clock, Calendar, 
  CheckSquare, Layers, Building2, User, IndianRupee, 
  AlertCircle, ChevronRight, Filter, Search, X, Edit2, 
  Trash2, FileText, Download, Bell, Pin, Globe, Lock,
  UploadCloud, Eye, ExternalLink, ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ProjectsTasks() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(true);

  // Projects & Tasks State
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Documents State
  const [documents, setDocuments] = useState([]);
  const [docCategoryFilter, setDocCategoryFilter] = useState('all');
  const [docSearch, setDocSearch] = useState('');

  // Notices State
  const [notices, setNotices] = useState([]);
  const [noticeAudienceFilter, setNoticeAudienceFilter] = useState('all');

  // Modals - Project
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({
    projectCode: '',
    title: '',
    category: 'Stupa Construction',
    estimatedBudget: '',
    actualExpenditure: '0',
    startDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: '',
    location: 'Gelephu, Sarpang Dzongkhag, Bhutan',
    managerName: 'Ugyen Tshering',
    status: 'in_progress',
    completionPercent: 0,
    description: ''
  });
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);

  // Modals - Task
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assignedTo, setAssignedTo] = useState('Dorji Construction Team');
  const [priority, setPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);

  // Modals - Document
  const [showDocModal, setShowDocModal] = useState(false);
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Legal');
  const [docDesc, setDocDesc] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [showDeleteDocModal, setShowDeleteDocModal] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState(null);

  // Modals - Notice
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [currentNoticeId, setCurrentNoticeId] = useState(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeAudience, setNoticeAudience] = useState('all');
  const [noticeIsPinned, setNoticeIsPinned] = useState(false);
  const [noticeIsPublished, setNoticeIsPublished] = useState(true);
  const [noticeExpiresDate, setNoticeExpiresDate] = useState('');
  const [showDeleteNoticeModal, setShowDeleteNoticeModal] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState(null);

  // Data Fetchers
  const fetchProjectsAndTasks = async () => {
    try {
      setLoading(true);
      const [pRes, tRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/tasks')
      ]);
      if (pRes.data.success) {
        setProjects(pRes.data.data || []);
        if (pRes.data.data?.length > 0 && !selectedProjectId) {
          setSelectedProjectId(pRes.data.data[0].id.toString());
        }
      }
      if (tRes.data.success) setTasks(tRes.data.data || []);
    } catch (err) {
      console.error('Failed to load projects/tasks:', err);
      error('Failed to load projects & tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents');
      if (res.data.success) setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      error('Failed to load documents vault');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notices?all=true');
      if (res.data.success) setNotices(res.data.data || []);
    } catch (err) {
      console.error('Failed to load notices:', err);
      error('Failed to load official notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'projects') fetchProjectsAndTasks();
    else if (activeTab === 'documents') fetchDocuments();
    else if (activeTab === 'notices') fetchNotices();
  }, [activeTab]);

  // Project Handlers
  const handleOpenCreateProject = () => {
    setIsEditingProject(false);
    setCurrentProjectId(null);
    setProjectForm({
      projectCode: 'PRJ-' + Date.now().toString().slice(-4),
      title: '',
      category: 'Stupa Construction',
      estimatedBudget: '',
      actualExpenditure: '0',
      startDate: new Date().toISOString().split('T')[0],
      targetCompletionDate: '',
      location: 'Gelephu, Sarpang Dzongkhag, Bhutan',
      managerName: 'Ugyen Tshering',
      status: 'in_progress',
      completionPercent: 0,
      description: ''
    });
    setShowProjectModal(true);
  };

  const handleOpenEditProject = (p) => {
    setIsEditingProject(true);
    setCurrentProjectId(p.id);
    setProjectForm({
      projectCode: p.project_code || '',
      title: p.title || '',
      category: p.category || 'Stupa Construction',
      estimatedBudget: p.estimated_budget || '',
      actualExpenditure: p.actual_expenditure || 0,
      startDate: p.start_date ? new Date(p.start_date).toISOString().split('T')[0] : '',
      targetCompletionDate: p.target_completion_date ? new Date(p.target_completion_date).toISOString().split('T')[0] : '',
      location: p.location || '',
      managerName: p.manager_name || '',
      status: p.status || 'in_progress',
      completionPercent: p.completion_percent || 0,
      description: p.description || ''
    });
    setShowProjectModal(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...projectForm,
        estimatedBudget: parseFloat(projectForm.estimatedBudget) || 0,
        actualExpenditure: parseFloat(projectForm.actualExpenditure) || 0,
        completionPercent: parseInt(projectForm.completionPercent, 10) || 0
      };

      if (isEditingProject) {
        const res = await api.put('/projects/' + currentProjectId, payload);
        if (res.data.success) {
          success('Project details updated successfully');
          setShowProjectModal(false);
          fetchProjectsAndTasks();
        }
      } else {
        const res = await api.post('/projects', payload);
        if (res.data.success) {
          success('Monastic Project created successfully');
          setShowProjectModal(false);
          fetchProjectsAndTasks();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    try {
      const res = await api.delete('/projects/' + deletingProject.id);
      if (res.data.success) {
        success('Project deleted successfully');
        setShowDeleteProjectModal(false);
        setDeletingProject(null);
        fetchProjectsAndTasks();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  // Task Handlers
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects/tasks', {
        projectId: parseInt(selectedProjectId, 10),
        title: taskTitle,
        description: taskDesc,
        assignedTo,
        priority,
        dueDate: taskDueDate || null,
        status: 'todo'
      });
      if (res.data.success) {
        success('Task created successfully');
        setShowTaskModal(false);
        setTaskTitle('');
        setTaskDesc('');
        setTaskDueDate('');
        fetchProjectsAndTasks();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
      const res = await api.put('/projects/tasks/' + taskId, { status: nextStatus });
      if (res.data.success) {
        success('Task marked as ' + nextStatus.replace('_', ' '));
        fetchProjectsAndTasks();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      const res = await api.delete('/projects/tasks/' + deletingTask.id);
      if (res.data.success) {
        success('Task deleted successfully');
        setShowDeleteTaskModal(false);
        setDeletingTask(null);
        fetchProjectsAndTasks();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // Document Handlers
  const handleOpenUploadDoc = () => {
    setIsEditingDoc(false);
    setCurrentDocId(null);
    setDocTitle('');
    setDocCategory('Legal');
    setDocDesc('');
    setDocFile(null);
    setShowDocModal(true);
  };

  const handleOpenEditDoc = (doc) => {
    setIsEditingDoc(true);
    setCurrentDocId(doc.id);
    setDocTitle(doc.title);
    setDocCategory(doc.category || 'Legal');
    setDocDesc(doc.description || '');
    setDocFile(null);
    setShowDocModal(true);
  };

  const handleSaveDoc = async (e) => {
    e.preventDefault();
    try {
      if (isEditingDoc) {
        const res = await api.put('/documents/' + currentDocId, {
          title: docTitle,
          category: docCategory,
          description: docDesc
        });
        if (res.data.success) {
          success('Document metadata updated');
          setShowDocModal(false);
          fetchDocuments();
        }
      } else {
        if (!docFile) {
          error('Please select a file to upload');
          return;
        }
        const formData = new FormData();
        formData.append('title', docTitle);
        formData.append('category', docCategory);
        formData.append('description', docDesc);
        formData.append('file', docFile);

        const res = await api.post('/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          success('Document uploaded to vault');
          setShowDocModal(false);
          fetchDocuments();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save document');
    }
  };

  const handleDeleteDoc = async () => {
    if (!deletingDoc) return;
    try {
      const res = await api.delete('/documents/' + deletingDoc.id);
      if (res.data.success) {
        success('Document deleted from vault');
        setShowDeleteDocModal(false);
        setDeletingDoc(null);
        fetchDocuments();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete document');
    }
  };

  // Notice Handlers
  const handleOpenCreateNotice = () => {
    setIsEditingNotice(false);
    setCurrentNoticeId(null);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeAudience('all');
    setNoticeIsPinned(false);
    setNoticeIsPublished(true);
    setNoticeExpiresDate('');
    setShowNoticeModal(true);
  };

  const handleOpenEditNotice = (n) => {
    setIsEditingNotice(true);
    setCurrentNoticeId(n.id);
    setNoticeTitle(n.title);
    setNoticeContent(n.content);
    setNoticeAudience(n.target_audience || 'all');
    setNoticeIsPinned(Boolean(n.is_pinned));
    setNoticeIsPublished(Boolean(n.is_published));
    setNoticeExpiresDate(n.expires_date ? new Date(n.expires_date).toISOString().split('T')[0] : '');
    setShowNoticeModal(true);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: noticeTitle,
        content: noticeContent,
        targetAudience: noticeAudience,
        isPinned: noticeIsPinned ? 1 : 0,
        isPublished: noticeIsPublished ? 1 : 0,
        expiresDate: noticeExpiresDate || null
      };

      if (isEditingNotice) {
        const res = await api.put('/notices/' + currentNoticeId, payload);
        if (res.data.success) {
          success('Notice updated successfully');
          setShowNoticeModal(false);
          fetchNotices();
        }
      } else {
        const res = await api.post('/notices', payload);
        if (res.data.success) {
          success('Notice published to community');
          setShowNoticeModal(false);
          fetchNotices();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save notice');
    }
  };

  const handleDeleteNotice = async () => {
    if (!deletingNotice) return;
    try {
      const res = await api.delete('/notices/' + deletingNotice.id);
      if (res.data.success) {
        success('Notice deleted');
        setShowDeleteNoticeModal(false);
        setDeletingNotice(null);
        fetchNotices();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete notice');
    }
  };

  // Filters
  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch = !searchQuery || 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigned_to?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredDocs = documents.filter((d) => {
    const matchesCat = docCategoryFilter === 'all' || d.category === docCategoryFilter;
    const matchesSearch = !docSearch ||
      d.title?.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.description?.toLowerCase().includes(docSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredNotices = notices.filter((n) => {
    return noticeAudienceFilter === 'all' || n.target_audience === noticeAudienceFilter;
  });

  const totalBudget = projects.reduce((acc, p) => acc + (parseFloat(p.estimated_budget) || 0), 0);
  const totalSpent = projects.reduce((acc, p) => acc + (parseFloat(p.actual_expenditure) || 0), 0);
  const activeProjectsCount = projects.filter(p => p.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#090D16] border border-[#2A1E17] p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20">
              <FolderKanban className="w-5 h-5 text-[#E11D48]" />
            </span>
            <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-white">
              Projects, Documents & Official Notices
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Track stupa construction, vault legal documents & architectural blueprints, and broadcast monastic communications.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#0D121F] border border-white/10 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] shadow'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Projects & Tasks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'documents'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] shadow'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documents Vault</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notices')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'notices'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] shadow'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Official Notices</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PROJECTS & TASKS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={handleOpenCreateProject}
              className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Active Projects</span>
                <span className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Building2 className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-2 font-mono">{activeProjectsCount}</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">{projects.length} Total Monastic Portfolios</p>
            </div>

            <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Total Sanctioned Budget</span>
                <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <IndianRupee className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-2 font-mono">₹{totalBudget.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">Capital grants & major pledges</p>
            </div>

            <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Total Disbursed</span>
                <span className="p-2 rounded-lg bg-[#E11D48]/10 text-[#E11D48]">
                  <IndianRupee className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#E11D48] mt-2 font-mono">₹{totalSpent.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% budget utilized</p>
            </div>

            <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Milestones & Tasks</span>
                <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <CheckSquare className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-2 font-mono">{tasks.length}</p>
              <p className="text-[11px] text-emerald-400 mt-1">
                {tasks.filter(t => t.status === 'completed').length} completed
              </p>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => {
              const budget = parseFloat(p.estimated_budget || 0);
              const spent = parseFloat(p.actual_expenditure || 0);
              const completion = p.completion_percent || (p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0);

              return (
                <div key={p.id} className="bg-[#0D121F] border border-[#2A1E17] hover:border-[#D4AF37]/40 rounded-2xl p-6 space-y-4 shadow-xl transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase tracking-wider">
                        {p.category || 'Monastic Infrastructure'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          p.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-white/10 text-white border border-white/20'
                        }`}>
                          {p.status?.replace('_', ' ') || 'ACTIVE'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditProject(p)}
                          className="p-1 rounded bg-white/5 hover:bg-[#D4AF37]/20 text-[#94A3B8] hover:text-[#D4AF37] transition-all"
                          title="Edit Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingProject(p);
                            setShowDeleteProjectModal(true);
                          }}
                          className="p-1 rounded bg-white/5 hover:bg-red-500/20 text-[#94A3B8] hover:text-red-400 transition-all"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif-brand font-bold text-base text-white">{p.title}</h3>
                      <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{p.description || 'Sacred temple architecture milestone.'}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
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
                    </div>
                  </div>

                  <div className="pt-2">
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
              );
            })}
          </div>

          {/* Tasks Register */}
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-serif-brand font-bold text-base text-white">
                  Milestone Tasks & Deliverables Register
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">Real-time status tracking for stupa carving, gilding, and library framing.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-semibold focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="todo">To Do</option>
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
                    <th className="py-3.5 px-4">Assigned Team</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
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
                              Due: {new Date(t.due_date).toLocaleDateString('en-GB')}
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
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(t.id, t.status)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                t.status === 'completed'
                                  ? 'bg-white/5 hover:bg-white/10 text-[#94A3B8] border border-white/10'
                                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {t.status === 'completed' ? 'Mark Active' : 'Complete'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingTask(t);
                                setShowDeleteTaskModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-[#94A3B8] hover:text-red-400 border border-white/10 transition-all"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENTS VAULT */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0D121F] border border-[#2A1E17] p-5 rounded-2xl shadow-xl">
            <div>
              <h3 className="font-serif-brand font-bold text-base text-white">Cryptographic Documents Vault</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Secure repository for 80G tax exemptions, monastic land titles, building permits, and audits.</p>
            </div>

            <button
              type="button"
              onClick={handleOpenUploadDoc}
              className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Vault Document</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#090D16] border border-white/5 p-4 rounded-xl">
            <div className="flex flex-wrap gap-2">
              {['all', 'Legal', 'Blueprints', '80G Approvals', 'Audits', 'Sacred Texts', 'Minutes'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setDocCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    docCategoryFilter === cat
                      ? 'bg-[#D4AF37] text-[#090D16]'
                      : 'bg-white/5 text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All Documents' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0D121F] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-[#090D16] text-[#94A3B8] font-bold uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-5">Document Title</th>
                    <th className="py-3.5 px-4">Classification</th>
                    <th className="py-3.5 px-4">Size & Format</th>
                    <th className="py-3.5 px-4">Vaulted On</th>
                    <th className="py-3.5 px-4">Archived By</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-[#94A3B8]">
                        No documents found in vault matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#D4AF37]" />
                            <span>{doc.title}</span>
                          </div>
                          {doc.description && (
                            <div className="text-[11px] text-[#94A3B8] mt-0.5 ml-6">{doc.description}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase">
                            {doc.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#94A3B8] font-mono">
                          {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Direct Archival'}
                        </td>
                        <td className="py-3.5 px-4 text-[#94A3B8]">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-white font-semibold">
                          {doc.uploader_name || 'System Admin'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <a
                              href={doc.file_path}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="px-2.5 py-1 bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] font-bold text-xs rounded-lg flex items-center gap-1 shadow hover:opacity-90"
                            >
                              <Download className="w-3 h-3" />
                              <span>Get</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleOpenEditDoc(doc)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-[#D4AF37]/20 text-[#94A3B8] hover:text-[#D4AF37] border border-white/10 transition-all"
                              title="Edit Metadata"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingDoc(doc);
                                setShowDeleteDocModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-[#94A3B8] hover:text-red-400 border border-white/10 transition-all"
                              title="Delete Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIAL NOTICES */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0D121F] border border-[#2A1E17] p-5 rounded-2xl shadow-xl">
            <div>
              <h3 className="font-serif-brand font-bold text-base text-white">Monastery Announcements & Public Gazettes</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Broadcast sacred pujas, ecclesiastical ordinances, examination schedules, and volunteer notices.</p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateNotice}
              className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 bg-[#090D16] border border-white/5 p-4 rounded-xl">
            {['all', 'public', 'monks', 'staff', 'donors'].map((aud) => (
              <button
                key={aud}
                type="button"
                onClick={() => setNoticeAudienceFilter(aud)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  noticeAudienceFilter === aud
                    ? 'bg-[#D4AF37] text-[#090D16]'
                    : 'bg-white/5 text-[#94A3B8] hover:text-white'
                }`}
              >
                {aud}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNotices.length === 0 ? (
              <div className="col-span-full py-12 text-center text-[#94A3B8] bg-[#0D121F] border border-white/5 rounded-2xl">
                No active announcements found for this audience.
              </div>
            ) : (
              filteredNotices.map((n) => (
                <div key={n.id} className="bg-[#0D121F] border border-[#2A1E17] hover:border-[#D4AF37]/30 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        {Boolean(n.is_pinned) && (
                          <span className="p-1 rounded bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20" title="Pinned Announcement">
                            <Pin className="w-3.5 h-3.5 fill-[#E11D48]" />
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase tracking-wider">
                          {n.target_audience}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          Boolean(n.is_published) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {Boolean(n.is_published) ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditNotice(n)}
                          className="p-1 rounded bg-white/5 hover:bg-[#D4AF37]/20 text-[#94A3B8] hover:text-[#D4AF37] transition-all"
                          title="Edit Notice"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingNotice(n);
                            setShowDeleteNoticeModal(true);
                          }}
                          className="p-1 rounded bg-white/5 hover:bg-red-500/20 text-[#94A3B8] hover:text-red-400 transition-all"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-serif-brand font-bold text-base text-white">{n.title}</h4>
                    <p className="text-xs text-[#CBD5E1] whitespace-pre-line line-clamp-4">{n.content}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[11px] text-[#94A3B8]">
                    <span>Published: {n.published_date ? new Date(n.published_date).toLocaleDateString('en-GB') : '—'}</span>
                    <span>By {n.author_name || 'Abbot Secretariate'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Building2 className="w-5 h-5" />
                </span>
                <h3 className="font-serif-brand font-bold text-base text-white">
                  {isEditingProject ? 'Edit Monastic Project' : 'Create Monastic Project'}
                </h3>
              </div>
              <button type="button" onClick={() => setShowProjectModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Project Code *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.projectCode}
                    onChange={(e) => setProjectForm({ ...projectForm, projectCode: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Category</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Stupa Construction">Stupa Construction</option>
                    <option value="Shedra Expansion">Shedra Expansion</option>
                    <option value="Solar Electrification">Solar Electrification</option>
                    <option value="Sacred Library Archiving">Sacred Library Archiving</option>
                    <option value="Monk Health Clinic">Monk Health Clinic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="e.g. Drodul Phendey Ling Maha Stupa Phase II"
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Sanctioned Budget (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={projectForm.estimatedBudget}
                    onChange={(e) => setProjectForm({ ...projectForm, estimatedBudget: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Disbursed Expenditure (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={projectForm.actualExpenditure}
                    onChange={(e) => setProjectForm({ ...projectForm, actualExpenditure: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Target Completion</label>
                  <input
                    type="date"
                    value={projectForm.targetCompletionDate}
                    onChange={(e) => setProjectForm({ ...projectForm, targetCompletionDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Completion % (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={projectForm.completionPercent}
                    onChange={(e) => setProjectForm({ ...projectForm, completionPercent: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Site Location</label>
                <input
                  type="text"
                  value={projectForm.location}
                  onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Architect / Manager</label>
                <input
                  type="text"
                  value={projectForm.managerName}
                  onChange={(e) => setProjectForm({ ...projectForm, managerName: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Project Description</label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] font-bold rounded-xl shadow-lg"
                >
                  {isEditingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteProjectModal && deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif-brand font-bold text-base text-red-400">Delete Project</h3>
              <button type="button" onClick={() => setShowDeleteProjectModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Are you sure you want to delete project <span className="font-bold text-white">{deletingProject.title}</span>? All associated milestone tasks will also be removed.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteProjectModal(false)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Delete Project
              </button>
            </div>
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
                <h3 className="font-serif-brand font-bold text-base text-white">Add Milestone Task</h3>
              </div>
              <button type="button" onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-white">
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
                  placeholder="e.g. Copper gilding of Pinnacle Spire"
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Assigned Artisan / Team</label>
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
                <label className="block font-bold text-[#CBD5E1] mb-1">Due Date</label>
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
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl font-bold shadow-lg"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Task Modal */}
      {showDeleteTaskModal && deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif-brand font-bold text-base text-red-400">Delete Task</h3>
              <button type="button" onClick={() => setShowDeleteTaskModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Delete milestone task <span className="font-bold text-white">{deletingTask.title}</span>?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteTaskModal(false)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <FileText className="w-5 h-5" />
                </span>
                <h3 className="font-serif-brand font-bold text-base text-white">
                  {isEditingDoc ? 'Edit Document Details' : 'Vault New Document'}
                </h3>
              </div>
              <button type="button" onClick={() => setShowDocModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Royal Land Endowment Deed 2026"
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Classification *</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="Legal">Legal</option>
                  <option value="Blueprints">Blueprints</option>
                  <option value="80G Approvals">80G Approvals</option>
                  <option value="Audits">Audits</option>
                  <option value="Sacred Texts">Sacred Texts</option>
                  <option value="Minutes">Minutes</option>
                </select>
              </div>

              {!isEditingDoc && (
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Upload File (PDF/Doc/Image) *</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setDocFile(e.target.files[0])}
                    className="w-full p-2 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#D4AF37] file:text-[#090D16] file:font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Document Description</label>
                <textarea
                  rows={3}
                  value={docDesc}
                  onChange={(e) => setDocDesc(e.target.value)}
                  placeholder="Summary of terms, seal numbers, registration stamps..."
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] font-bold rounded-xl shadow-lg"
                >
                  {isEditingDoc ? 'Update Metadata' : 'Vault Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Document Modal */}
      {showDeleteDocModal && deletingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif-brand font-bold text-base text-red-400">Delete Document</h3>
              <button type="button" onClick={() => setShowDeleteDocModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Delete <span className="font-bold text-white">{deletingDoc.title}</span> from the vault permanently?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteDocModal(false)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDoc}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Bell className="w-5 h-5" />
                </span>
                <h3 className="font-serif-brand font-bold text-base text-white">
                  {isEditingNotice ? 'Edit Notice' : 'Broadcast Official Notice'}
                </h3>
              </div>
              <button type="button" onClick={() => setShowNoticeModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Notice Headline *</label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Annual Kagyed Chaam Mask Dance Schedule"
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Target Audience</label>
                  <select
                    value={noticeAudience}
                    onChange={(e) => setNoticeAudience(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none uppercase"
                  >
                    <option value="all">All Audiences</option>
                    <option value="public">Public</option>
                    <option value="monks">Monks / Scholars</option>
                    <option value="staff">Administrative Staff</option>
                    <option value="donors">Donors & Devotees</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={noticeExpiresDate}
                    onChange={(e) => setNoticeExpiresDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noticeIsPinned}
                    onChange={(e) => setNoticeIsPinned(e.target.checked)}
                    className="rounded bg-[#090D16] border-white/10 text-[#D4AF37] focus:ring-0"
                  />
                  <span className="font-bold text-white">Pin to Top</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noticeIsPublished}
                    onChange={(e) => setNoticeIsPublished(e.target.checked)}
                    className="rounded bg-[#090D16] border-white/10 text-emerald-400 focus:ring-0"
                  />
                  <span className="font-bold text-white">Published Live</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Gazette Content *</label>
                <textarea
                  rows={4}
                  required
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Full text of notice, timings, monastic discipline or donation details..."
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] font-bold rounded-xl shadow-lg"
                >
                  {isEditingNotice ? 'Save Updates' : 'Broadcast Gazette'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Notice Modal */}
      {showDeleteNoticeModal && deletingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif-brand font-bold text-base text-red-400">Delete Notice</h3>
              <button type="button" onClick={() => setShowDeleteNoticeModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Delete announcement <span className="font-bold text-white">{deletingNotice.title}</span>?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteNoticeModal(false)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteNotice}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Delete Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
