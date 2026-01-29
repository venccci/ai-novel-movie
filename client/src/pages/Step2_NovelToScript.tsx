import React, { useState } from 'react';
import {
  Loader2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { ScriptScene, ProjectData, AITask } from '../types';
import { callDeepSeek } from '../utils/api';
import { Button } from '../components/ui';

interface Step2ScriptProps {
  novel: string;
  setNovel: (s: string) => void;
  scriptData: ScriptScene[];
  setScriptData: (data: ScriptScene[]) => void;
  projectData: ProjectData;
  onNext: () => void;
  addAITask: (task: Omit<AITask, 'id'>) => string;
  updateAITask: (id: string, updates: Partial<AITask>) => void;
}

const Step2Script: React.FC<Step2ScriptProps> = ({ 
  novel, 
  setNovel, 
  scriptData, 
  setScriptData, 
  projectData,
  onNext,
  addAITask,
  updateAITask
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeNovel = async () => {
    if (!novel.trim()) {
      setError("请输入小说内容");
      return;
    }
    
    setError(null);
    setScriptData([]);
    setIsAnalyzing(true);

    // 创建AI任务
    const taskId = addAITask({
      type: 'script',
      status: 'processing',
      description: '小说转剧本中...'
    });

    try {
      const systemPrompt = `You are a professional screenwriter assistant.
      Analyze the user's novel text and convert it into a structured movie script based on the project settings.
      
      Project Settings:
      - Title: ${projectData.title}
      - Visual Style: ${projectData.style}
      - Custom Tone: ${projectData.customPrompt}

      Return ONLY a valid JSON object with a single key "scenes" which is an array of objects.
      Each object must have:
      - "id": number
      - "location": string (Scene heading)
      - "time": string (DAY/NIGHT)
      - "characters": string (List characters in this scene)
      - "description": string (Action lines and dialogue summary)
      `;

      const data = await callDeepSeek(systemPrompt, novel);
      if (data.scenes && Array.isArray(data.scenes)) {
        setScriptData(data.scenes);
        updateAITask(taskId, {
          status: 'completed',
          description: '小说转剧本完成',
          result: data.scenes
        });
      } else {
        throw new Error("Invalid JSON structure");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "生成失败，请重试");
      updateAITask(taskId, {
        status: 'failed',
        description: '小说转剧本失败',
        error: err.message || "生成失败，请重试"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 剧本编辑功能
  const updateScene = (id: number, field: keyof ScriptScene, value: string) => {
    const updated = scriptData.map(scene => 
      scene.id === id ? { ...scene, [field]: value } : scene
    );
    setScriptData(updated);
  };

  const addScene = () => {
    const newId = scriptData.length > 0 ? Math.max(...scriptData.map(s => s.id)) + 1 : 1;
    setScriptData([...scriptData, {
      id: newId,
      location: '新场景',
      time: 'DAY',
      characters: '',
      description: '输入剧情描述...'
    }]);
  };

  const deleteScene = (id: number) => {
    setScriptData(scriptData.filter(s => s.id !== id));
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">小说转剧本</h2>
          <p className="text-zinc-400">基于小说原文拆解场次，支持手动修正剧情。</p>
        </div>
        <Button 
          variant="accent" 
          icon={Loader2} 
          onClick={analyzeNovel}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "提取中..." : "一键提取剧本"}
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 h-full min-h-0">
        <div className="flex flex-col gap-2 h-full min-h-0">
          <div className="flex justify-between items-center text-sm text-zinc-400 px-1">
            <span>原文输入</span>
            <span className="text-xs border border-zinc-700 px-2 py-0.5 rounded bg-zinc-800">Markdown 支持</span>
          </div>
          <textarea 
            className="flex-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-zinc-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm leading-relaxed"
            placeholder="在此粘贴小说章节内容..."
            value={novel}
            onChange={(e) => setNovel(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 h-full min-h-0">
          <div className="flex justify-between items-center text-sm text-zinc-400 px-1">
            <span>剧本结构预览 (可编辑)</span>
            <Button variant="ghost" size="sm" icon={Plus} onClick={addScene}>添加场次</Button>
          </div>
          <div className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-y-scroll custom-scrollbar relative">
             
             {error && (
               <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                 <AlertCircle size={16} />
                 {error}
               </div>
             )}

             <div className="space-y-4">
                {scriptData.map((scene) => (
                  <div key={scene.id} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg group hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/20 whitespace-nowrap">
                        场景 {scene.id}
                      </span>
                      <input 
                        className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-blue-500 text-zinc-300 font-medium text-sm w-full outline-none px-1"
                        value={scene.location}
                        onChange={(e) => updateScene(scene.id, 'location', e.target.value)}
                        placeholder="场景地点"
                      />
                      <select 
                        className="bg-zinc-900 text-zinc-400 text-xs border border-zinc-800 rounded outline-none p-1"
                        value={scene.time}
                        onChange={(e) => updateScene(scene.id, 'time', e.target.value)}
                      >
                        <option>DAY</option>
                        <option>NIGHT</option>
                      </select>
                      <button onClick={() => deleteScene(scene.id)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-zinc-600 text-xs whitespace-nowrap">角色:</span>
                      <input 
                        className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-blue-500 text-zinc-400 text-sm w-full outline-none px-1"
                        value={scene.characters}
                        onChange={(e) => updateScene(scene.id, 'characters', e.target.value)}
                        placeholder="出场角色"
                      />
                    </div>
                    
                    <textarea 
                      className="w-full bg-zinc-950/50 text-zinc-400 text-sm p-2 rounded border border-zinc-800/50 focus:border-blue-500 focus:bg-zinc-900 outline-none resize-none"
                      rows={3}
                      value={scene.description}
                      onChange={(e) => updateScene(scene.id, 'description', e.target.value)}
                      placeholder="剧情描述..."
                    />
                  </div>
                ))}
                
                {scriptData.length === 0 && !isAnalyzing && (
                  <div className="text-center text-zinc-600 mt-20 flex flex-col items-center">
                    <BookOpen size={48} className="mb-4 opacity-20" />
                    <p>暂无剧本</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
      
      {scriptData.length > 0 && (
        <div className="pt-4 border-t border-zinc-800 flex justify-end">
           <Button onClick={onNext} icon={ArrowRight}>确认剧本并生成角色</Button>
        </div>
      )}
    </div>
  );
};

export default Step2Script;