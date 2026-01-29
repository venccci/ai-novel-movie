import React from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from './ui';

interface TopBarProps {
  currentStep: string;
  projectTitle: string;
  onSave?: () => void;
  onHomeClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ currentStep: _currentStep, projectTitle, onSave, onHomeClick }) => {
  return (
    <div className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {onHomeClick && (
          <Button variant="ghost" icon={ArrowLeft} onClick={onHomeClick} className="mr-2">
            返回首页
          </Button>
        )}
        <span className="text-sm text-zinc-500">当前工程:</span>
        <span className="text-sm font-medium text-white bg-zinc-900 px-3 py-1 rounded border border-zinc-800 flex items-center gap-2">
           {projectTitle || '未命名项目'}
           <span className={`w-1.5 h-1.5 rounded-full ${projectTitle ? 'bg-green-500' : 'bg-zinc-500'}`}></span>
        </span>
      </div>
       <div className="flex items-center gap-4">
         <Button variant="ghost" icon={Save} onClick={onSave}>保存</Button>
       </div>
    </div>
  );
};

export default TopBar;