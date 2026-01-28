import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import TopNav from './components/TopNav';
import PipelineSidebar from './components/PipelineSidebar';
import PreviewPanel from './components/PreviewPanel';
import Step1_ProjectStyle from './pages/Step1_ProjectStyle';
import Step2_NovelToScript from './pages/Step2_NovelToScript';
import Step3_CharacterDesign from './pages/Step3_CharacterDesign';
import Step4_DirectorScript from './pages/Step4_DirectorScript';

function App() {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const handleStepChange = (event: CustomEvent) => {
      setCurrentStep(event.detail.step);
    };

    // Add event listener for step changes
    window.addEventListener('stepChange', handleStepChange as EventListener);

    return () => {
      window.removeEventListener('stepChange', handleStepChange as EventListener);
    };
  }, []);

  const stepTitles = [
    { id: 1, title: '项目 & 风格设定', path: 'project-style' },
    { id: 2, title: '小说剧本生成', path: 'novel-to-script' },
    { id: 3, title: '角色设计', path: 'character-design' },
    { id: 4, title: '导演脚本生成', path: 'director-script' },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_ProjectStyle />;
      case 2:
        return <Step2_NovelToScript />;
      case 3:
        return <Step3_CharacterDesign />;
      case 4:
        return <Step4_DirectorScript />;
      default:
        return <Step1_ProjectStyle />;
    }
  };

  const currentStepTitle = stepTitles.find(step => step.id === currentStep)?.title || '';

  return (
    <div className="flex flex-col h-screen font-sans bg-background">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <PipelineSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb Navigation */}
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">AI Novel Movie</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <span className="text-primary font-medium">{currentStepTitle}</span>
            </nav>
          </div>
          
          {/* Main Content Area with Grid Layout */}
          <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-y-auto">
            {/* Step Content - 8 columns */}
            <div className="col-span-8">
              <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                {renderStep()}
              </div>
            </div>
            
            {/* Preview Panel - 4 columns */}
            <div className="col-span-4">
              <PreviewPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
