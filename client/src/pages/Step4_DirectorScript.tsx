import React, { useState } from 'react';
import { 
  Film,
  Lock,
  Unlock,
  AlertTriangle
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
  isLocked: boolean;
  onLock: () => void;
  onUnlock: () => void;
  addAITask: (task: Omit<AITask, 'id'>) => string;
  updateAITask: (id: string, updates: Partial<AITask>) => void;
}

const Step4Storyboard: React.FC<Step4StoryboardProps> = ({ 
  shots, 
  setShots, 
  scriptData, 
  characters: _characters, 
  projectData,
  isLocked,
  onLock,
  onUnlock,
  addAITask,
  updateAITask
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const updateShot = (index: number, updates: Partial<Shot>) => {
    const newShots = [...shots];
    newShots[index] = { ...newShots[index], ...updates };
    setShots(newShots);
  };

  const normalizeShotIds = (source: Shot[]) => {
    return source.map((shot, idx) => ({ ...shot, id: idx + 1 }));
  };

  const toggleKeyShot = (index: number) => {
    const current = shots[index];
    const hasKeyTag = current.tags?.includes('key_shot');
    const nextTags = hasKeyTag
      ? current.tags.filter(tag => tag !== 'key_shot')
      : [...(current.tags || []), 'key_shot'];
    updateShot(index, { tags: nextTags });
  };

  const toggleShotLock = (index: number) => {
    updateShot(index, { locked: !shots[index].locked });
  };

  const splitShot = (index: number) => {
    const source = shots[index];
    const halfDuration = source.durationSec ? Number((source.durationSec / 2).toFixed(1)) : undefined;
    const firstHalf: Shot = {
      ...source,
      durationSec: halfDuration ?? source.durationSec,
      locked: false,
    };
    const secondHalf: Shot = {
      ...source,
      durationSec: halfDuration ?? source.durationSec,
      description: `${source.description}（拆分）`,
      locked: false,
    };
    const merged = [...shots.slice(0, index), firstHalf, secondHalf, ...shots.slice(index + 1)];
    setShots(normalizeShotIds(merged));
  };

  const mergeWithPrevious = (index: number) => {
    if (index <= 0) return;
    const previous = shots[index - 1];
    const current = shots[index];
    if (previous.locked || current.locked) return;
    const mergedShot: Shot = {
      ...previous,
      description: `${previous.description} ${current.description}`.trim(),
      audio: [previous.audio, current.audio].filter(Boolean).join(' / '),
      prompt: [previous.prompt, current.prompt].filter(Boolean).join('\n'),
      tags: Array.from(new Set([...(previous.tags || []), ...(current.tags || [])])),
      durationSec: (previous.durationSec || 0) + (current.durationSec || 0) || undefined,
      locked: false,
    };
    const merged = [...shots.slice(0, index - 1), mergedShot, ...shots.slice(index + 1)];
    setShots(normalizeShotIds(merged));
  };

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
          audio: s.audio || '',
          durationSec: typeof s.durationSec === 'number' ? s.durationSec : undefined,
          locked: false
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

  const validateShots = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (shots.length === 0) {
      errors.push('至少需要 1 个镜头才能锁定分镜。');
      return { errors, warnings, totalDuration: 0 };
    }

    const emptyDescriptionCount = shots.filter(s => !s.description?.trim()).length;
    if (emptyDescriptionCount > 0) {
      errors.push(`${emptyDescriptionCount} 个镜头缺少画面描述。`);
    }

    const emptyAudioCount = shots.filter(s => !s.audio?.trim()).length;
    if (emptyAudioCount > 0) {
      errors.push(`${emptyAudioCount} 个镜头缺少台词/旁白绑定。`);
    }

    const emptyPromptCount = shots.filter(s => !s.prompt?.trim()).length;
    if (emptyPromptCount > 0) {
      errors.push(`${emptyPromptCount} 个镜头缺少提示词。`);
    }

    const invalidDurationCount = shots.filter(
      s => s.durationSec !== undefined && (!Number.isFinite(Number(s.durationSec)) || Number(s.durationSec) <= 0)
    ).length;
    if (invalidDurationCount > 0) {
      errors.push(`${invalidDurationCount} 个镜头时长无效（必须大于 0）。`);
    }

    const hasDurationForAll = shots.every(s => s.durationSec !== undefined);
    const totalDuration = shots.reduce((sum, s) => sum + (Number(s.durationSec) || 0), 0);
    if (!hasDurationForAll) {
      warnings.push('存在未填写时长的镜头，建议补全后再锁定。');
    } else if (projectData.episodeDuration > 0) {
      const diffRate = Math.abs(totalDuration - projectData.episodeDuration) / projectData.episodeDuration;
      if (diffRate > 0.2) {
        errors.push(
          `分镜总时长 ${Math.round(totalDuration)}s 与目标时长 ${projectData.episodeDuration}s 偏差超过 20%。`
        );
      }
    }

    return { errors, warnings, totalDuration };
  };

  const validation = validateShots();

  const handleLockStoryboard = () => {
    if (validation.errors.length > 0) {
      alert(`锁定失败，请先修复以下问题：\n- ${validation.errors.join('\n- ')}`);
      return;
    }
    onLock();
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
             disabled={isGenerating || isLocked}
           >
             {isGenerating ? "生成中..." : "生成分镜表"}
           </Button>
           <Button
             variant={isLocked ? 'secondary' : 'outline'}
             icon={isLocked ? Unlock : Lock}
             onClick={isLocked ? onUnlock : handleLockStoryboard}
           >
             {isLocked ? '解锁分镜' : '锁定分镜'}
           </Button>
        </div>
      </div>

      {shots.length > 0 && (
        <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-sm">
          <div className="mb-2 flex items-center gap-2 text-zinc-300">
            <AlertTriangle size={14} className={validation.errors.length > 0 ? 'text-red-400' : 'text-green-400'} />
            <span>分镜校验</span>
            <span className="text-zinc-500">总时长: {Math.round(validation.totalDuration)}s / 目标 {projectData.episodeDuration}s</span>
          </div>
          {validation.errors.map((error, idx) => (
            <div key={`err-${idx}`} className="mb-1 text-xs text-red-300">• {error}</div>
          ))}
          {validation.warnings.map((warning, idx) => (
            <div key={`warn-${idx}`} className="mb-1 text-xs text-amber-300">• {warning}</div>
          ))}
          {validation.errors.length === 0 && (
            <div className="text-xs text-emerald-300">• 校验通过，可锁定分镜。</div>
          )}
        </div>
      )}

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
               <div className="col-span-1 mt-1">
                 <div className="font-mono text-zinc-400">S-{shot.id}</div>
                 {shot.locked && <div className="mt-1 text-[10px] text-amber-300">镜头已锁定</div>}
                 <div className="mt-2 flex flex-col gap-1">
                   <button
                     className="text-left text-[10px] text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                     onClick={() => toggleKeyShot(index)}
                     disabled={isLocked || shot.locked}
                   >
                     {shot.tags?.includes('key_shot') ? '取消关键镜头' : '标记关键镜头'}
                   </button>
                   <button
                     className="text-left text-[10px] text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                     onClick={() => toggleShotLock(index)}
                     disabled={isLocked}
                   >
                     {shot.locked ? '解锁镜头' : '锁定镜头'}
                   </button>
                   <button
                     className="text-left text-[10px] text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                     onClick={() => splitShot(index)}
                     disabled={isLocked || shot.locked}
                   >
                     拆分镜头
                   </button>
                   <button
                     className="text-left text-[10px] text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                     onClick={() => mergeWithPrevious(index)}
                     disabled={isLocked || shot.locked || index === 0 || shots[index - 1]?.locked}
                   >
                     合并上个
                   </button>
                 </div>
               </div>
               
               <div className="col-span-5 space-y-2">
                 <textarea 
                   className="w-full bg-transparent text-zinc-300 text-sm resize-none outline-none border border-transparent hover:border-zinc-700 focus:border-blue-500 rounded p-2 transition-all"
                   rows={3}
                   value={shot.description}
                   onChange={(e) => updateShot(index, { description: e.target.value })}
                   disabled={isLocked || shot.locked}
                 />
                 <div className="flex flex-wrap gap-2">
                   {shot.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${
                          tag === 'key_shot'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        #{tag}
                      </span>
                   ))}
                 </div>
               </div>

               <div className="col-span-2 space-y-2">
                 <select
                   className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 p-1.5 outline-none"
                   value={shot.shotType || '中景'}
                   onChange={(e) => updateShot(index, { shotType: e.target.value })}
                   disabled={isLocked || shot.locked}
                 >
                    <option>特写</option>
                    <option>中景</option>
                    <option>全景</option>
                    <option>近景</option>
                    <option>远景</option>
                 </select>
                 <select
                   className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 p-1.5 outline-none"
                   value={shot.cameraMove || '固定'}
                   onChange={(e) => updateShot(index, { cameraMove: e.target.value })}
                   disabled={isLocked || shot.locked}
                 >
                    <option>固定</option>
                    <option>摇摄</option>
                    <option>推轨</option>
                    <option>升降</option>
                    <option>手持</option>
                 </select>
                 <input
                   type="number"
                   min="0.5"
                   step="0.5"
                   className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 p-1.5 outline-none"
                   placeholder="时长(s)"
                   value={shot.durationSec ?? ''}
                   onChange={(e) => {
                     const nextValue = e.target.value;
                     updateShot(index, {
                       durationSec: nextValue === '' ? undefined : Number(nextValue)
                     });
                   }}
                   disabled={isLocked || shot.locked}
                 />
               </div>

               <div className="col-span-2">
                  <textarea
                    className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-400 p-1.5 outline-none resize-none"
                    rows={3}
                    value={shot.audio || ''}
                    placeholder="输入台词/旁白"
                    onChange={(e) => updateShot(index, { audio: e.target.value })}
                    disabled={isLocked || shot.locked}
                  />
               </div>

               <div className="col-span-2">
                 <textarea 
                   className="w-full h-full bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-400 p-1.5 outline-none resize-none"
                   rows={3}
                   value={shot.prompt || ''}
                   placeholder="输入提示词"
                   onChange={(e) => updateShot(index, { prompt: e.target.value })}
                   disabled={isLocked || shot.locked}
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
