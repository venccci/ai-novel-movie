import { useState } from 'react';
import { StepType, ProjectData, ScriptScene, Character, Shot, StepsStatus, Project, AITask, WorkflowLocks } from './types';
import Sidebar from './components/PipelineSidebar';
import TopBar from './components/TopNav';
import Step1ProjectStyle from './pages/Step1_ProjectStyle';
import Step2Script from './pages/Step2_NovelToScript';
import Step3Characters from './pages/Step3_CharacterDesign';
import Step4Storyboard from './pages/Step4_DirectorScript';
import Dashboard from './pages/Dashboard';

const defaultLocks: WorkflowLocks = {
  script: false,
  characters: false,
  storyboard: false,
};

function App() {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [step, setStep] = useState<StepType>('project');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  const [projectData, setProjectData] = useState<ProjectData>({
    // 基础信息与视觉设定默认值
    title: '',
    style: 'anime',
    ratio: '16:9',
    language: 'zh',
    // 提示词推荐默认值
    customPrompt: 'masterpiece, best quality, 8k, highly detailed, cinematic lighting, ultra high res',
    negativePrompt: 'low quality, watermark, text, bad anatomy, extra limbs, blurry, overexposed, underexposed',
    // 叙事与节奏参数默认值
    episodeDuration: 3600, // 默认1小时
    shotDensity: 60, // 默认每10分钟60个镜头
    narrationRatio: 20, // 默认旁白占比20%
    dialogueRatio: 40, // 默认对白占比40%
    pacing: 'medium', // 默认中等节奏
    // AI 行为约束配置默认值
    characterConsistency: 80, // 默认角色一致性80%
    creativeFreedom: 60, // 默认创意自由度60%
    cameraMovementIntensity: 50 // 默认运镜强度50%
  });
  const [novel, setNovel] = useState('');
  const [scriptData, setScriptData] = useState<ScriptScene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [locks, setLocks] = useState<WorkflowLocks>(defaultLocks);
  
  // AI 任务管理
  const addAITask = (task: Omit<AITask, 'id'>) => {
    const newTask: AITask = {
      ...task,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    // 简单返回任务ID，不做状态管理
    return newTask.id;
  };
  
  const updateAITask = () => {
    // 简单的更新函数，不做状态管理
  };

  const stepsStatus: StepsStatus = {
    project: true,
    script: !!projectData.title && !!projectData.style && !!projectData.ratio,
    characters: scriptData.length > 0 && locks.script,
    storyboard: characters.length > 0 && locks.characters,
  };

  const lockScript = () => {
    setLocks(prev => ({ ...prev, script: true }));
  };

  const unlockScript = () => {
    setLocks(prev => ({ ...prev, script: false, characters: false, storyboard: false }));
  };

  const lockCharacters = () => {
    setLocks(prev => ({ ...prev, script: true, characters: true }));
  };

  const unlockCharacters = () => {
    setLocks(prev => ({ ...prev, characters: false, storyboard: false }));
  };

  const lockStoryboard = () => {
    setLocks(prev => ({ ...prev, script: true, characters: true, storyboard: true }));
  };

  const unlockStoryboard = () => {
    setLocks(prev => ({ ...prev, storyboard: false }));
  };

  const updateProjectData = (key: string, val: any) => {
    setProjectData(prev => ({ ...prev, [key]: val }));
  };

  const openProject = async (project: Project) => {
    setCurrentProjectId(project.id);
    // 加载项目数据
    try {
      const response = await fetch(`http://localhost:4000/api/projects/${project.id}`);
      if (!response.ok) throw new Error('加载项目失败');
      const projectData = await response.json();
      // 更新所有状态
      setProjectData(projectData.projectData || {
        // 基础信息与视觉设定默认值
        title: project.title || '',
        style: 'anime',
        ratio: '16:9',
        language: 'zh',
        // 提示词推荐默认值
        customPrompt: 'masterpiece, best quality, 8k, highly detailed, cinematic lighting, ultra high res',
        negativePrompt: 'low quality, watermark, text, bad anatomy, extra limbs, blurry, overexposed, underexposed',
        // 叙事与节奏参数默认值
        episodeDuration: 3600,
        shotDensity: 60,
        narrationRatio: 20,
        dialogueRatio: 40,
        pacing: 'medium',
        // AI 行为约束配置默认值
        characterConsistency: 80,
        creativeFreedom: 60,
        cameraMovementIntensity: 50
      });
      setNovel(projectData.novel || '');
      setScriptData(projectData.scriptData || []);
      setCharacters(projectData.characters || []);
      setShots(projectData.shots || []);
      setLocks(projectData.locks || defaultLocks);
    } catch (error) {
      console.error('加载项目错误:', error);
      // 如果加载失败，至少设置标题
      setProjectData(prev => ({ ...prev, title: project.title }));
      setLocks(defaultLocks);
    }
    setView('editor');
    setStep('project');
  };

  const saveProject = async () => {
    let projectId = currentProjectId;
    if (!projectId) {
      // 如果没有当前项目ID，先创建项目
      const response = await fetch('http://localhost:4000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: projectData.title || '未命名项目' }),
      });
      if (!response.ok) throw new Error('创建项目失败');
      const newProject = await response.json();
      projectId = newProject.id;
      setCurrentProjectId(projectId);
    }
    // 保存项目数据到后端
    const projectState = {
      title: projectData.title,
      projectData,
      novel,
      scriptData,
      characters,
      shots,
      locks,
    };
    try {
      const response = await fetch(`http://localhost:4000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectState),
      });
      if (!response.ok) throw new Error('保存失败');
      alert('保存成功');
    } catch (error) {
      console.error('保存错误:', error);
      alert('保存失败');
    }
  };

  if (view === 'dashboard') {
    return <Dashboard onOpenProject={openProject} />;
  }

  return (
    <div className="flex h-screen w-full bg-black text-zinc-200 font-sans">
      <Sidebar currentStep={step} setStep={setStep} stepsStatus={stepsStatus} onHomeClick={() => setView('dashboard')} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar currentStep={step} projectTitle={projectData.title} onSave={saveProject} onHomeClick={() => setView('dashboard')} />
        
        <main className="flex-1 p-6 overflow-hidden">
           <div className="h-full max-w-6xl mx-auto flex flex-col">
             {step === 'project' && (
               <Step1ProjectStyle 
                 data={projectData} 
                 updateData={updateProjectData} 
                 onNext={() => setStep('script')}
               />
             )}
             
             {step === 'script' && (
               <Step2Script 
                  novel={novel}
                  setNovel={setNovel}
                  scriptData={scriptData}
                  setScriptData={setScriptData}
                  projectData={projectData}
                  onNext={() => setStep('characters')}
                  isLocked={locks.script}
                  onLock={lockScript}
                  onUnlock={unlockScript}
                  addAITask={addAITask}
                  updateAITask={updateAITask}
               />
             )}
             
             {step === 'characters' && (
               <Step3Characters 
                  characters={characters}
                  setCharacters={setCharacters}
                  scriptData={scriptData}
                  projectData={projectData}
                  onNext={() => setStep('storyboard')}
                  isLocked={locks.characters}
                  onLock={lockCharacters}
                  onUnlock={unlockCharacters}
                  addAITask={addAITask}
                  updateAITask={updateAITask}
               />
             )}
             
             {step === 'storyboard' && (
               <Step4Storyboard 
                  shots={shots}
                  setShots={setShots}
                  scriptData={scriptData}
                  characters={characters}
                  projectData={projectData}
                  isLocked={locks.storyboard}
                  onLock={lockStoryboard}
                  onUnlock={unlockStoryboard}
                  addAITask={addAITask}
                  updateAITask={updateAITask}
               />
             )}
           </div>
        </main>
      </div>
    </div>
  );
}

export default App;
