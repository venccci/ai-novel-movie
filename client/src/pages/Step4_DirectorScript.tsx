import React, { useState } from 'react';
import { 
  Film
} from 'lucide-react';
import { Shot, ScriptScene, Character, ProjectData, AITask } from '../types';
import { callDeepSeek } from '../utils/api';
import { Button } from '../components/ui';

interface Step4StoryboardProps {
  shots: Shot[];
  setShots: (s: Shot[] | ((prev: Shot[]) => Shot[])) => void;
  scriptData: ScriptScene[];
  characters: Character[];
  projectData: ProjectData;
  addAITask: (task: Omit<AITask, 'id'>) => string;
  updateAITask: (id: string, updates: Partial<AITask>) => void;
}

const Step4Storyboard: React.FC<Step4StoryboardProps> = ({ 
  shots, 
  setShots, 
  scriptData, 
  characters: _characters, 
  projectData,
  addAITask,
  updateAITask
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStoryboard = async () => {
    setIsGenerating(true);
    // 创建AI任务
    const taskId = addAITask({
      type: 'storyboard',
      status: 'processing',
      description: '生成分镜脚本中...'
    });

    try {
       const scriptContext = JSON.stringify(scriptData);
       const charContext = _characters.map(c => `${c.name}: 外貌${c.appearance}, 背景${c.background}`).join('; ');
       const systemPrompt = `你是一位专业的电影分镜师和提示词专家。请根据剧本生成详细的分镜表，涵盖所有场景和重要时刻。
       
       项目设置：
       - 标题：${projectData.title}
       - 视觉风格：${projectData.style}
       - 自定义风格：${projectData.customPrompt}
       
       角色信息：${charContext}
       
       要求：
       1. 生成完整的分镜，确保覆盖剧本中的所有场景和关键情节
       2. 为每个镜头生成详细的AI提示词，提示词应包含：
          - 场景描述和氛围
          - 角色外貌和动作
          - 镜头类型和构图
          - 光线和色彩
          - 参考风格和细节
       3. 提示词必须详细、具体，能够直接用于AI图像生成
       4. 确保返回的JSON格式正确，没有额外的文本或格式
       
       返回JSON格式：{ "shots": [{ "id", "description", "shotType", "cameraMove", "audio", "tags", "prompt" }] }`;

      const data = await callDeepSeek(systemPrompt, scriptContext);
      if (data.shots && Array.isArray(data.shots)) {
        // 为每个镜头添加默认的图片状态
        const formattedShots = data.shots.map((s: any, index: number) => ({
          ...s,
          id: index + 1, // 确保id是连续的数字
          imgStatus: 'empty',
          shotType: s.shotType || '中景',
          cameraMove: s.cameraMove || '固定',
          tags: s.tags || [],
          audio: s.audio || ''
        }));
        setShots(formattedShots);
        updateAITask(taskId, {
          status: 'completed',
          description: '分镜脚本生成完成',
          result: formattedShots
        });
      } else {
        throw new Error("AI返回的数据格式不正确，缺少shots字段");
      }
    } catch (err: any) {
      console.error('分镜生成失败:', err);
      alert(`分镜生成失败: ${err.message || '请检查网络连接或重试'}`);
      updateAITask(taskId, {
        status: 'failed',
        description: '分镜脚本生成失败',
        error: err.message || "生成失败，请重试"
      });
    } finally {
      setIsGenerating(false);
    }
  };



  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">分镜脚本 & 绘图</h2>
          <p className="text-zinc-400">AI 辅助导演创作，支持逐个镜头微调与出图。</p>
        </div>
        <div className="flex gap-3">
           <Button 
             variant="accent" 
             icon={Film} 
             onClick={generateStoryboard}
             disabled={isGenerating}
           >
             {isGenerating ? "生成中..." : "生成分镜表"}
           </Button>
        </div>
      </div>

      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 grid grid-cols-12 gap-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
        <div className="col-span-1">序号</div>
        <div className="col-span-5">画面描述 (可编辑)</div>
        <div className="col-span-2">参数设置</div>
        <div className="col-span-2">台词</div>
        <div className="col-span-2 text-right">提示词</div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {shots.map((shot, index) => (
            <div key={index} className="group border-b border-zinc-800 hover:bg-zinc-900/30 transition-colors grid grid-cols-12 gap-4 px-4 py-4 items-start">
               <div className="col-span-1 text-zinc-400 font-mono mt-1">S-{shot.id}</div>
               
               <div className="col-span-5 space-y-2">
                 <textarea 
                   className="w-full bg-transparent text-zinc-300 text-sm resize-none outline-none border border-transparent hover:border-zinc-700 focus:border-blue-500 rounded p-2 transition-all"
                   rows={3}
                   value={shot.description}
                   onChange={(e) => {
                     const newShots = [...shots];
                     newShots[index].description = e.target.value;
                     setShots(newShots);
                   }}
                 />
                 <div className="flex flex-wrap gap-2">
                   {shot.tags?.map((tag, idx) => (
                      <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded cursor-pointer hover:text-white">#{tag}</span>
                   ))}
                 </div>
               </div>

               <div className="col-span-2 space-y-2">
                 <select className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 p-1.5 outline-none">
                    <option>{shot.shotType}</option>
                    <option>特写</option>
                    <option>中景</option>
                    <option>全景</option>
                    <option>近景</option>
                    <option>远景</option>
                 </select>
                 <select className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 p-1.5 outline-none">
                    <option>{shot.cameraMove}</option>
                    <option>固定</option>
                    <option>摇摄</option>
                    <option>推轨</option>
                    <option>升降</option>
                    <option>手持</option>
                 </select>
               </div>

               <div className="col-span-2">
                  <p className="text-xs text-zinc-500 italic">{shot.audio}</p>
               </div>

               <div className="col-span-2">
                 <textarea 
                   className="w-full h-full bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-400 p-1.5 outline-none resize-none"
                   rows={3}
                   value={shot.prompt || '生成提示词...'}
                   readOnly
                 />
               </div>
            </div>
        ))}
        {shots.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-zinc-600">
             <Film size={48} className="mb-4 opacity-20" />
             <p className="mb-4">暂无分镜数据</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4Storyboard;