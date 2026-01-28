import { useState } from 'react';
import { Save, Lock, ChevronRight, Settings, Sparkles, Sliders } from 'lucide-react';

const Step1_ProjectStyle = () => {
  const [activeTab, setActiveTab] = useState('visual');
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    targetPlatform: '抖音',
    projectLanguage: '中文',
    styleTemplate: '',
    visual: {
      aspectRatio: '9:16',
      resolution: '1080x1920',
      artStyle: '国漫',
      renderStyle: '线稿',
    },
    narrative: {
      episode_duration: 60,
      shots_per_minute: 15,
      pacing: '中',
    },
    ai: {
      consistency_level: '中',
      creativity_level: '中',
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    // Check if the id belongs to a nested object
    if (id in formData.visual) {
      setFormData(prev => ({
        ...prev,
        visual: { ...prev.visual, [id]: value }
      }));
    } else if (id in formData.narrative) {
      setFormData(prev => ({
        ...prev,
        narrative: { ...prev.narrative, [id]: value }
      }));
    } else if (id in formData.ai) {
      setFormData(prev => ({
        ...prev,
        ai: { ...prev.ai, [id]: value }
      }));
    } else {
      // Top-level fields
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleTemplateClick = (template: string) => {
    setFormData(prev => ({...prev, styleTemplate: template}));
  }

  const handleLockConfig = async () => {
    console.log("Sending data to backend:", formData);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.projectName,
          description: formData.projectDescription,
          targetPlatform: formData.targetPlatform,
          language: formData.projectLanguage,
          visual: formData.visual,
          narrative: formData.narrative,
          aiConstraints: formData.ai,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Project created successfully:', result);
      alert('项目创建成功！');
      // Here you would typically navigate to the next step
      // e.g., router.push('/step-2');

    } catch (error) {
      console.error('Failed to create project:', error);
      alert('项目创建失败，请查看控制台获取更多信息。');
    }
  };

  const styleTemplates = ["国漫·热血", "日漫·校园", "写实·剧情", "Q版·轻喜剧"];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'visual':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700 mb-2">画面比例</label>
              <select id="aspectRatio" value={formData.visual.aspectRatio} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-[1rem] bg-center%20bg-[length%3A_1.5em_1.5em] pr-10">
                <option>9:16</option>
                <option>16:9</option>
              </select>
            </div>
            <div>
              <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-2">分辨率</label>
              <select id="resolution" value={formData.visual.resolution} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-[1rem] bg-center%20bg-[length%3A_1.5em_1.5em] pr-10">
                <option>1080x1920</option>
                <option>1920x1080</option>
              </select>
            </div>
            <div>
              <label htmlFor="artStyle" className="block text-sm font-medium text-gray-700 mb-2">艺术风格</label>
              <select id="artStyle" value={formData.visual.artStyle} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-[1rem] bg-center%20bg-[length%3A_1.5em_1.5em] pr-10">
                <option>国漫</option>
                <option>日漫</option>
                <option>写实</option>
              </select>
            </div>
            <div>
              <label htmlFor="renderStyle" className="block text-sm font-medium text-gray-700 mb-2">渲染风格</label>
              <select id="renderStyle" value={formData.visual.renderStyle} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-[1rem] bg-center%20bg-[length%3A_1.5em_1.5em] pr-10">
                <option>线稿</option>
                <option>厚涂</option>
              </select>
            </div>
          </div>
        );
      case 'narrative':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label htmlFor="episode_duration" className="block text-sm font-medium text-gray-700 mb-2">单集时长 (秒)</label>
              <input type="number" id="episode_duration" value={formData.narrative.episode_duration} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300" />
            </div>
            <div>
              <label htmlFor="shots_per_minute" className="block text-sm font-medium text-gray-700 mb-2">镜头密度 (个/分钟)</label>
              <input type="number" id="shots_per_minute" value={formData.narrative.shots_per_minute} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="pacing" className="block text-sm font-medium text-gray-700 mb-2">节奏</label>
              <select id="pacing" value={formData.narrative.pacing} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-[1rem] bg-center%20bg-[length%3A_1.5em_1.5em] pr-10">
                <option>快</option>
                <option>中</option>
                <option>慢</option>
              </select>
            </div>
          </div>
        );
      case 'ai':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label htmlFor="consistency_level" className="block text-sm font-medium text-gray-700 mb-2">角色一致性要求</label>
              <select id="consistency_level" value={formData.ai.consistency_level} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-[1rem] bg-center%20bg-[length%3A_1.5em_1.5em] pr-10">
                <option>高</option>
                <option>中</option>
                <option>低</option>
              </select>
            </div>
            <div>
              <label htmlFor="creativity_level" className="block text-sm font-medium text-gray-700 mb-2">创意自由度</label>
              <select id="creativity_level" value={formData.ai.creativity_level} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-[1rem] bg-center%20bg-[length%3A_1.5em_1.5em] pr-10">
                <option>高</option>
                <option>中</option>
                <option>低</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div>
       <div className="mb-8">
         <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">项目 & 风格设定</h2>
         <p className="text-gray-600 mt-3 text-lg">配置您的项目基础信息、视觉风格和AI行为参数</p>
       </div>

      {/* Basic Information Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-50 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          基本信息
        </h3>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
              项目名称 (必填)
            </label>
            <input
              type="text"
              id="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300"
              placeholder="例如：我的第一部漫剧"
            />
          </div>
          <div>
            <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
              项目描述 (可选)
            </label>
            <textarea
              id="projectDescription"
              rows={3}
              value={formData.projectDescription}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300"
              placeholder="关于一个勇敢少年探索未知世界的故事..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="targetPlatform" className="block text-sm font-medium text-gray-700 mb-2">
                目标平台
              </label>
              <select
                id="targetPlatform"
                value={formData.targetPlatform}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-[1rem] bg-center%20bg-[length%3A_1.5em_1.5em] pr-10"
              >
                <option>抖音</option>
                <option>快手</option>
                <option>B站</option>
                <option>YouTube</option>
              </select>
            </div>
            <div>
              <label htmlFor="projectLanguage" className="block text-sm font-medium text-gray-700 mb-2">
                项目语言
              </label>
              <select
                id="projectLanguage"
                value={formData.projectLanguage}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-gray-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-[1rem] bg-center%20bg-[length%3A_1.5em_1.5em] pr-10"
              >
                <option>中文</option>
                <option>多语言</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Style Template Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-50 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          风格模板
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {styleTemplates.map((template) => (
            <button
              key={template}
              onClick={() => handleTemplateClick(template)}
              className={`p-5 border rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${formData.styleTemplate === template ? 'bg-gradient-to-br from-primary to-secondary text-white border-primary shadow-lg shadow-primary/20' : 'border-gray-200 hover:border-primary hover:shadow-md'}`}
            >
              <div className="font-medium">{template}</div>
            </button>
          ))}
           <button
              onClick={() => handleTemplateClick('custom')}
              className={`p-5 border-2 border-dashed rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${formData.styleTemplate === 'custom' ? 'bg-gradient-to-br from-primary to-secondary text-white border-primary shadow-lg shadow-primary/20' : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary hover:shadow-md'}`}
            >
              <div className="text-lg font-bold">+</div>
              <div className="text-sm">自定义风格</div>
            </button>
        </div>
      </div>
      
      {/* Detailed Configuration */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-50 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Sliders className="w-5 h-5 text-primary" />
          </div>
          详细配置
        </h3>
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('visual')}
              className={`whitespace-nowrap py-3 px-6 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-300 ${activeTab === 'visual' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              视觉规格
            </button>
            <button
              onClick={() => setActiveTab('narrative')}
              className={`whitespace-nowrap py-3 px-6 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-300 ${activeTab === 'narrative' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              叙事节奏
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`whitespace-nowrap py-3 px-6 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-300 ${activeTab === 'ai' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              AI行为约束
            </button>
          </nav>
        </div>
        {renderActiveTab()}
      </div>

       {/* Action Buttons */}
       <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100">
         <button className="px-8 py-3.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-100 flex items-center space-x-2 transition-all duration-300 shadow-sm hover:shadow">
           <Save className="w-4 h-4" />
           <span>保存草稿</span>
         </button>
         <button 
           onClick={handleLockConfig}
           className="px-8 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center space-x-2 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
         >
           <Lock className="w-4 h-4" />
           <span>锁定配置并进入下一步</span>
           <ChevronRight className="w-4 h-4" />
         </button>
       </div>
    </div>
  );
};

export default Step1_ProjectStyle;
