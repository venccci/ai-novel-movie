import { useState } from 'react';
import { 
  CheckCircle2, 
  Lock, 
  PlayCircle, 
  Settings, 
  FileText, 
  Users, 
  Film,
  ChevronRight 
} from 'lucide-react';

interface Step {
  id: number;
  name: string;
  status: string;
  icon: React.ReactNode;
}

const PipelineSidebar = () => {
  const [steps, setSteps] = useState<Step[]>([
    { 
      id: 1, 
      name: "项目 & 风格设定", 
      status: "completed", 
      icon: <Settings className="w-5 h-5" />
    },
    { 
      id: 2, 
      name: "小说剧本生成", 
      status: "ready", 
      icon: <FileText className="w-5 h-5" />
    },
    { 
      id: 3, 
      name: "角色设计", 
      status: "locked", 
      icon: <Users className="w-5 h-5" />
    },
    { 
      id: 4, 
      name: "导演脚本生成", 
      status: "locked", 
      icon: <Film className="w-5 h-5" />
    },
  ]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { 
          icon: <CheckCircle2 className="w-5 h-5 text-cta" />,
          bgColor: "bg-cta/10",
          textColor: "text-cta",
          label: "已完成"
        };
      case "ready":
        return { 
          icon: <PlayCircle className="w-5 h-5 text-primary" />,
          bgColor: "bg-primary/10",
          textColor: "text-primary",
          label: "进行中"
        };
      case "processing":
        return { 
          icon: <div className="animate-spin">⏳</div>,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          label: "处理中"
        };
      case "locked":
        return { 
          icon: <Lock className="w-5 h-5 text-gray-400" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-500",
          label: "未解锁"
        };
      default:
        return { 
          icon: <Lock className="w-5 h-5 text-gray-400" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-500",
          label: "未解锁"
        };
    }
  };

  const handleStepClick = (index: number, stepStatus: string) => {
    if (stepStatus === "locked") return;
    
    // Update steps status based on clicked step
    const updatedSteps = steps.map((step, i) => {
      if (i < index) {
        return { ...step, status: "completed" };
      } else if (i === index) {
        return { ...step, status: "ready" };
      } else {
        return { ...step, status: "locked" };
      }
    });
    setSteps(updatedSteps);
    
    // Dispatch custom event to notify App component to change step
    const event = new CustomEvent('stepChange', { detail: { step: index + 1 } });
    window.dispatchEvent(event);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-text-primary">创作流水线</h2>
        <p className="text-sm text-gray-500 mt-1">AI Novel Movie 生产流程</p>
      </div>
      
      <div className="p-4">
        <div className="space-y-2">
          {steps.map((step, index) => {
            const statusConfig = getStatusConfig(step.status);
            const isActive = step.status === "ready";
            const isClickable = step.status !== "locked";
            
            return (
              <div 
                key={step.id}
                className={`relative rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/5 border border-primary/20 shadow-sm' 
                    : 'hover:bg-gray-50'
                } ${!isClickable ? 'opacity-60' : 'cursor-pointer'}`}
                onClick={() => handleStepClick(index, step.status)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig.bgColor}`}>
                        <div className={statusConfig.textColor}>
                          {step.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-text-primary">{step.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs font-medium ${statusConfig.textColor}`}>
                            {statusConfig.label}
                          </span>
                          {isActive && (
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {statusConfig.icon}
                      {isClickable && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  
                  {/* Progress indicator for completed steps */}
                  {step.status === "completed" && index < steps.length - 1 && (
                    <div className="absolute left-5 top-full w-0.5 h-4 bg-cta"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">进度概览</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">已完成步骤</p>
              <p className="text-lg font-semibold text-text-primary">
                {steps.filter(s => s.status === "completed").length} / {steps.length}
              </p>
            </div>
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cta rounded-full transition-all duration-500"
                style={{ 
                  width: `${(steps.filter(s => s.status === "completed").length / steps.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PipelineSidebar;
