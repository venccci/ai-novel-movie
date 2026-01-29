import React from 'react';
import { 
  Clapperboard, 
  Settings, 
  BookOpen, 
  Users, 
  Film, 
  ChevronRight,
  Lock 
} from 'lucide-react';
import { StepType, StepsStatus } from '../types';

interface SidebarProps {
  currentStep: StepType;
  setStep: (s: StepType) => void;
  stepsStatus: StepsStatus;
  onHomeClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentStep, 
  setStep, 
  stepsStatus,
  onHomeClick 
}) => {
  const steps = [
    { id: 'project' as StepType, icon: Settings, label: '项目设定' },
    { id: 'script' as StepType, icon: BookOpen, label: '剧本生成' },
    { id: 'characters' as StepType, icon: Users, label: '角色设计' },
    { id: 'storyboard' as StepType, icon: Film, label: '分镜脚本' },
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col flex-shrink-0">
      <button 
        className="w-full p-6 flex items-center gap-3 text-white mb-6 hover:bg-zinc-900/50 transition-colors"
        onClick={onHomeClick}
      >
        <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
          <Clapperboard size={18} className="text-white" />
        </div>
        <h1 className="font-bold text-lg tracking-tight">AI Movie Studio</h1>
      </button>

      <nav className="flex-1 px-4 space-y-2">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isEnabled = stepsStatus[step.id];
          
          return (
            <button
              key={step.id}
              onClick={() => isEnabled && setStep(step.id)}
              disabled={!isEnabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800' 
                  : isEnabled 
                    ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                    : 'text-zinc-700 cursor-not-allowed opacity-50'
              }`}
            >
              <step.icon size={18} className={isActive ? 'text-blue-500' : isEnabled ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-800'} />
              <span>{step.label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto text-zinc-600" />}
              {!isEnabled && <Lock size={12} className="ml-auto text-zinc-800" />}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 text-xs text-zinc-600 text-center">
         v1.3.0 • DeepSeek Pro
      </div>
    </div>
  );
};

export default Sidebar;