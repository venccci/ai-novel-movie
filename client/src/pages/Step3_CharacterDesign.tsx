import React, { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Plus, 
  Trash2, 
  ArrowRight,
  Users,
  Lock,
  Unlock
} from 'lucide-react';
import { Character, ScriptScene, ProjectData, AITask } from '../types';
import { callDeepSeek } from '../utils/api';
import { Button } from '../components/ui';

interface Step3CharactersProps {
  characters: Character[];
  setCharacters: (c: Character[] | ((prev: Character[]) => Character[])) => void;
  scriptData: ScriptScene[];
  projectData: ProjectData;
  onNext: () => void;
  isLocked: boolean;
  onLock: () => void;
  onUnlock: () => void;
  addAITask: (task: Omit<AITask, 'id'>) => string;
  updateAITask: (id: string, updates: Partial<AITask>) => void;
}

const Step3Characters: React.FC<Step3CharactersProps> = ({ 
  characters, 
  setCharacters, 
  scriptData, 
  projectData, 
  onNext,
  isLocked,
  onLock,
  onUnlock,
  addAITask,
  updateAITask
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // AI 生成角色
  const generateCharacters = async () => {
    setIsGenerating(true);
    // 创建AI任务
    const taskId = addAITask({
      type: 'characters',
      status: 'processing',
      description: '从剧本提取角色中...'
    });

    try {
      const scriptSummary = scriptData.map(s => `Scene ${s.id}: ${s.description} (Chars: ${s.characters})`).join('\n');
      const systemPrompt = `Extract main characters from script. For each character, provide both appearance description and background story.
      Style: ${projectData.style}, ${projectData.customPrompt}.
      Return JSON: { "characters": [{ "name", "role", "appearance", "background" }] }`;
      
      const data = await callDeepSeek(systemPrompt, scriptSummary);
      if (data.characters && Array.isArray(data.characters)) {
        const newChars = data.characters.map((c: any) => ({
          ...c, id: Date.now() + Math.random(), status: 'pending', img: null
        }));
        setCharacters([...characters, ...newChars]); // Append instead of replace
        updateAITask(taskId, {
          status: 'completed',
          description: '角色提取完成',
          result: newChars
        });
      }
    } catch (err: any) {
      console.error(err);
      alert("角色生成失败");
      updateAITask(taskId, {
        status: 'failed',
        description: '角色提取失败',
        error: err.message || "生成失败，请重试"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 手动添加/编辑角色
  const addCharacter = () => {
    setCharacters([...characters, {
      id: Date.now(),
      name: '新角色',
      role: '配角',
      appearance: '请输入外貌描述...',
      background: '请输入角色背景...',
      status: 'pending',
      img: null
    }]);
  };

  const updateCharacter = (id: number, field: keyof Character, value: string) => {
    setCharacters(characters.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // 模拟生成单张角色立绘
  const generateImage = (id: number) => {
    setCharacters(characters.map(c => c.id === id ? { ...c, status: 'generating' } : c));
    setTimeout(() => {
       setCharacters((prev: Character[]) => prev.map((c: Character) => 
        c.id === id ? { 
          ...c, 
          status: 'ready', 
          img: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}&backgroundColor=b6e3f4` 
        } as Character : c
      ));
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">角色设计库</h2>
          <p className="text-zinc-400">管理角色资产，支持 AI 提取与手动微调。</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Plus} onClick={addCharacter} disabled={isLocked}>手动添加</Button>
          <Button 
            variant="accent" 
            icon={Sparkles} 
            onClick={generateCharacters}
            disabled={isGenerating || isLocked}
          >
            {isGenerating ? "提取中..." : "从剧本提取角色"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
          {characters.map((char) => (
            <div key={char.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col hover:border-zinc-600 transition-colors group relative">
              
              <div className="flex justify-between items-center mb-4">
                <input 
                  className="font-bold text-white text-lg bg-transparent outline-none w-full focus:border-b border-blue-500"
                  value={char.name}
                  onChange={(e) => updateCharacter(char.id, 'name', e.target.value)}
                  placeholder="角色名称"
                  disabled={isLocked}
                />
                <button
                  onClick={() => setCharacters(characters.filter(c => c.id !== char.id))}
                  disabled={isLocked}
                  className="text-zinc-600 hover:text-red-400 p-1 ml-2 flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16}/>
                </button>
              </div>
              
              {/* Image Area */}
              <div className="w-32 h-32 bg-zinc-950 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-800 relative self-center mb-4">
                {char.status === 'ready' && char.img ? (
                  <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
                ) : char.status === 'generating' ? (
                  <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center text-blue-500">
                     <Loader2 className="animate-spin mb-1" size={20}/>
                     <span className="text-xs">绘制中</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Users size={24} className="text-zinc-700" />
                    <button 
                      onClick={() => generateImage(char.id)}
                      disabled={isLocked}
                      className="text-xs text-blue-400 hover:text-blue-300 underline disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      生成立绘
                    </button>
                  </div>
                )}
              </div>

              {/* Edit Area */}
              <div className="flex-1 flex flex-col gap-3">
                <input 
                  className="text-sm bg-zinc-950 text-zinc-400 px-2 py-1.5 rounded outline-none border border-zinc-800 focus:border-blue-500 w-full"
                  value={char.role}
                  onChange={(e) => updateCharacter(char.id, 'role', e.target.value)}
                  placeholder="角色定位"
                  disabled={isLocked}
                />
                
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">外貌描述</label>
                  <textarea 
                    className="text-sm text-zinc-300 bg-zinc-950/50 outline-none resize-none min-h-[80px] border border-zinc-800 rounded p-2 focus:border-blue-500 w-full"
                    value={char.appearance}
                    onChange={(e) => updateCharacter(char.id, 'appearance', e.target.value)}
                    placeholder="请详细描述角色的外貌特征..."
                    disabled={isLocked}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">角色背景</label>
                  <textarea 
                    className="text-sm text-zinc-300 bg-zinc-950/50 outline-none resize-none min-h-[80px] border border-zinc-800 rounded p-2 focus:border-blue-500 w-full"
                    value={char.background}
                    onChange={(e) => updateCharacter(char.id, 'background', e.target.value)}
                    placeholder="请详细描述角色的背景故事..."
                    disabled={isLocked}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {characters.length > 0 && (
        <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
           <Button
             variant={isLocked ? "secondary" : "outline"}
             icon={isLocked ? Unlock : Lock}
             onClick={isLocked ? onUnlock : onLock}
           >
             {isLocked ? "解锁角色" : "锁定角色"}
           </Button>
           <Button
             onClick={() => {
               if (!isLocked) onLock();
               onNext();
             }}
             icon={ArrowRight}
           >
             {isLocked ? "进入分镜脚本" : "锁定并进入分镜脚本"}
           </Button>
        </div>
      )}
    </div>
  );
};

export default Step3Characters;
