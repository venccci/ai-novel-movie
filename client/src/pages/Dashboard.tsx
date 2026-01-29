import React, { useState, useEffect } from 'react';
import { Plus, Search, FolderOpen, Trash2 } from 'lucide-react';
import { Button } from '../components/ui';
import Modal from '../components/ui/Modal';
import { Project } from '../types';

interface DashboardProps {
  onOpenProject: (project: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectTitle.trim()) return;
    try {
      const response = await fetch('http://localhost:4000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newProjectTitle }),
      });
      if (!response.ok) throw new Error('Failed to create project');
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setNewProjectTitle('');
      setIsCreateModalOpen(false);
      onOpenProject(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('确定删除该项目吗？')) return;
    try {
      const response = await fetch(`http://localhost:4000/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete project');
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const openProject = (project: Project) => {
    onOpenProject(project);
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen w-full bg-black text-zinc-200 font-sans">
      {/* 顶部导航 */}
      <div className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-white">AI Movie Studio</span>
          <span className="text-sm text-zinc-500">项目管理中心</span>
        </div>
        <div className="flex items-center gap-4">
          {/* 新建项目按钮已集成在下方 */}
        </div>
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        {/* 搜索和新建区域 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 w-96">
             <div className="relative w-full">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
               <input
                 type="text"
                 placeholder="搜索项目..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
               />
             </div>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            创建项目
          </Button>
        </div>

        {/* 项目网格 */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500">加载中...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-zinc-900">
              <FolderOpen size={48} className="text-zinc-700" />
            </div>
            <h3 className="text-xl font-medium text-zinc-400 mb-2">暂无项目</h3>
            <p className="text-zinc-600">创建你的第一个项目开始制作</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-all group cursor-pointer hover:shadow-lg hover:shadow-blue-900/10"
                onClick={() => openProject(project)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-white truncate">{project.title}</h3>
                    <p className="text-xs text-zinc-500">创建于 {new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    className="p-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止事件冒泡
                      deleteProject(project.id);
                    }}
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* 创建项目模态框 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewProjectTitle('');
        }}
        title="创建新项目"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">项目名称</label>
            <input
              type="text"
              placeholder="输入新项目名称"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => {
              setIsCreateModalOpen(false);
              setNewProjectTitle('');
            }}>
              取消
            </Button>
            <Button variant="primary" onClick={createProject} disabled={!newProjectTitle.trim()}>
              创建
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;