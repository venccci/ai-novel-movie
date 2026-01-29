import React, { useState } from 'react';
import { 
  Clapperboard, 
  BookOpen, 
  Users, 
  Film, 
  Settings, 
  ChevronRight, 
  Sparkles, 
  Upload, 
  Image as ImageIcon,
  Save,
  Play,
  Wand2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

// --- API Configuration ---
// TODO: For production, move this to .env file (VITE_API_KEY) and use a proxy server to hide the key.
const API_KEY = "sk-2736da0afc2b40419db7cbec6c3c50d5";
const API_URL = "https://api.deepseek.com/chat/completions";

// --- Types ---

type StepType = 'project' | 'script' | 'characters' | 'storyboard';

interface ProjectData {
  title: string;
  style: string;
  ratio: string;
  customPrompt: string; // [新增] 自定义正向提示词
  negativePrompt: string; // [新增] 自定义负向提示词
}

interface ScriptScene {
  id: number;
  location: string;
  time: string;
  characters: string;
  description: string;
}

interface Character {
  id: number;
  name: string;
  role: string;
  traits: string;
  status: 'ready' | 'generating' | 'pending';
  img: string | null;
}

interface Shot {
  id: number;
  description: string;
  shotType: string;
  cameraMove: string;
  audio: string;
  tags: string[];
  imgStatus?: 'empty' | 'generating' | 'done'; // [新增] 图片生成状态
}

// --- Helper Functions ---
const callDeepSeek = async (systemPrompt: string, userPrompt: string) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`API Request failed: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  // Clean markdown code blocks if AI wraps JSON in them
  content = content.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(content);
};

// --- UI Components ---

const Button = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  onClick, 
  className = '',
  disabled = false,
  size = 'md'
}: { 
  children?: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'outline' | 'danger'; 
  icon?: any; 
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const baseStyles = "flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200";
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 disabled:opacity-50",
    ghost: "hover:bg-zinc-800/50 text-zinc-400 hover:text-white",
    accent: "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 disabled:bg-purple-600/50 disabled:cursor-not-allowed",
    outline: "border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50",
    danger: "text-red-400 hover:bg-red-900/20 hover:text-red-300"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} className={disabled && variant === 'accent' ? 'animate-spin' : ''} />}
      {children}
    </button>
  );
};

const InputGroup = ({ label, children, desc }: { label: string; children: React.ReactNode; desc?: string }) => (
  <div className="space-y-2 mb-6">
    <label className="block text-sm font-medium text-zinc-300">
      {label}
      {desc && <span className="ml-2 text-xs text-zinc-500 font-normal">{desc}</span>}
    </label>
    {children}
  </div>
);

// --- Step Components ---

const Step1ProjectStyle = ({ 
  data, 
  updateData, 
  onNext 
}: { 
  data: ProjectData, 
  updateData: (key: string, val: any) => void,
  onNext: () => void 
}) => {
  const styles = [
    { id: 'anime', name: '日式动漫', desc: '色彩鲜艳，线条清晰', color: 'from-pink-500 to-rose-500' },
    { id: 'pixar', name: '3D 动画', desc: '皮克斯/迪士尼风格', color: 'from-blue-500 to-cyan-500' },
    { id: 'cyberpunk', name: '赛博朋克', desc: '高对比度，霓虹光感', color: 'from-purple-500 to-indigo-500' },
    { id: 'sketch', name: '黑白素描', desc: '手绘艺术风格', color: 'from-zinc-500 to-gray-500' },
  ];

  const ratios = ['16:9', '9:16', '1:1', '2.35:1'];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">项目初始设定</h2>
          <p className="text-zinc-400">定义你的漫剧基调、视觉风格与输出格式。</p>
        </div>

        <InputGroup label="项目名称">
          <input 
            type="text" 
            value={data.title}
            onChange={(e) => updateData('title', e.target.value)}
            placeholder="例如：星际迷航：最后的边疆"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </InputGroup>

        <InputGroup label="视觉风格" desc="决定画面生成的模型与LoRA">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {styles.map((style) => (
              <div 
                key={style.id}
                onClick={() => updateData('style', style.id)}
                className={`cursor-pointer group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${data.style === style.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-800 hover:border-zinc-600'}`}
              >
                <div className={`h-24 w-full bg-gradient-to-br ${style.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                <div className="p-3 absolute bottom-0 w-full bg-gradient-to-t from-zinc-900 to-transparent">
                  <div className="font-medium text-sm text-white">{style.name}</div>
                  <div className="text-xs text-zinc-400">{style.desc}</div>
                </div>
                {data.style === style.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </InputGroup>

        <div className="grid grid-cols-2 gap-6">
          <InputGroup label="额外提示词 (Prompt)" desc="补充更多画面细节">
            <textarea
              value={data.customPrompt}
              onChange={(e) => updateData('customPrompt', e.target.value)}
              placeholder="e.g. masterpiece, best quality, 8k, highly detailed..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white h-24 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </InputGroup>
          <InputGroup label="负向提示词 (Negative)" desc="不希望出现的元素">
            <textarea
              value={data.negativePrompt}
              onChange={(e) => updateData('negativePrompt', e.target.value)}
              placeholder="e.g. low quality, watermark, text, bad anatomy..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white h-24 text-sm resize-none focus:ring-2 focus:ring-red-500/50 outline-none"
            />
          </InputGroup>
        </div>

        <InputGroup label="画幅比例">
          <div className="flex gap-3">
            {ratios.map(r => (
              <button
                key={r}
                onClick={() => updateData('ratio', r)}
                className={`px-4 py-2 rounded-lg text-sm border transition-all ${data.ratio === r ? 'bg-zinc-100 text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </InputGroup>
      </div>

      <div className="pt-6 border-t border-zinc-800 flex justify-end">
        <Button onClick={onNext} disabled={!data.title} icon={ArrowRight}>
           确认设定并进入下一步
        </Button>
      </div>
    </div>
  );
};

const Step2Script = ({ 
  novel, 
  setNovel, 
  scriptData, 
  setScriptData, 
  projectData,
  onNext 
}: { 
  novel: string, 
  setNovel: (s: string) => void, 
  scriptData: ScriptScene[], 
  setScriptData: (data: ScriptScene[]) => void,
  projectData: ProjectData,
  onNext: () => void
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeNovel = async () => {
    if (!novel.trim()) {
      setError("请输入小说内容");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setScriptData([]);

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
      } else {
        throw new Error("Invalid JSON structure");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "生成失败，请重试");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // [新增] 剧本编辑功能
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
          icon={isAnalyzing ? Loader2 : Wand2} 
          onClick={analyzeNovel}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'DeepSeek 分析中...' : '一键提取剧本'}
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        <div className="flex flex-col gap-2">
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

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm text-zinc-400 px-1">
            <span>剧本结构预览 (可编辑)</span>
            <Button variant="ghost" size="sm" icon={Plus} onClick={addScene}>添加场次</Button>
          </div>
          <div className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-y-auto custom-scrollbar relative">
             
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

const Step3Characters = ({ 
  characters, 
  setCharacters, 
  scriptData, 
  projectData, 
  onNext 
 }: { 
  characters: Character[], 
  setCharacters: (c: Character[] | ((prev: Character[]) => Character[])) => void, 
  scriptData: ScriptScene[], 
  projectData: ProjectData, 
  onNext: () => void
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // [新增] AI 生成角色
  const generateCharacters = async () => {
    setIsGenerating(true);
    try {
      const scriptSummary = scriptData.map(s => `Scene ${s.id}: ${s.description} (Chars: ${s.characters})`).join('\n');
      const systemPrompt = `Extract main characters from script.
      Style: ${projectData.style}, ${projectData.customPrompt}.
      Return JSON: { "characters": [{ "name", "role", "traits" }] }`;
      
      const data = await callDeepSeek(systemPrompt, scriptSummary);
      if (data.characters && Array.isArray(data.characters)) {
        const newChars = data.characters.map((c: any) => ({
          ...c, id: Date.now() + Math.random(), status: 'pending', img: null
        }));
        setCharacters([...characters, ...newChars]); // Append instead of replace
      }
    } catch (err) { alert("角色生成失败"); } finally { setIsGenerating(false); }
  };

  // [新增] 手动添加/编辑角色
  const addCharacter = () => {
    setCharacters([...characters, {
      id: Date.now(),
      name: '新角色',
      role: '配角',
      traits: '请输入外貌特征...',
      status: 'pending',
      img: null
    }]);
  };

  const updateCharacter = (id: number, field: keyof Character, value: string) => {
    setCharacters(characters.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // [新增] 模拟生成单张角色立绘
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
          <Button variant="secondary" icon={Plus} onClick={addCharacter}>手动添加</Button>
          <Button 
            variant="accent" 
            icon={isGenerating ? Loader2 : Sparkles} 
            onClick={generateCharacters}
            disabled={isGenerating}
          >
            {isGenerating ? 'AI 分析中...' : '从剧本提取角色'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
          {characters.map((char) => (
            <div key={char.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-4 hover:border-zinc-600 transition-colors group relative">
              
              {/* Image Area */}
              <div className="w-24 h-24 bg-zinc-950 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-800 relative flex-shrink-0">
                {char.status === 'ready' && char.img ? (
                  <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
                ) : char.status === 'generating' ? (
                  <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center text-blue-500">
                     <Loader2 className="animate-spin mb-1" size={16}/>
                     <span className="text-[10px]">绘制中</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Users className="text-zinc-700" />
                    <button 
                      onClick={() => generateImage(char.id)}
                      className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                    >
                      生成立绘
                    </button>
                  </div>
                )}
              </div>

              {/* Edit Area */}
              <div className="flex-1 flex flex-col min-w-0 gap-2">
                <div className="flex justify-between items-start">
                  <input 
                    className="font-bold text-white bg-transparent outline-none w-20 focus:border-b border-blue-500"
                    value={char.name}
                    onChange={(e) => updateCharacter(char.id, 'name', e.target.value)}
                  />
                  <button onClick={() => setCharacters(characters.filter(c => c.id !== char.id))} className="text-zinc-600 hover:text-red-400 p-1">
                    <Trash2 size={14}/>
                  </button>
                </div>
                
                <input 
                  className="text-xs bg-zinc-950 text-zinc-400 px-2 py-1 rounded outline-none border border-zinc-800 focus:border-blue-500 w-full"
                  value={char.role}
                  onChange={(e) => updateCharacter(char.id, 'role', e.target.value)}
                />
                
                <textarea 
                  className="text-xs text-zinc-500 bg-transparent outline-none resize-none h-12 border-b border-transparent focus:border-zinc-700 p-1"
                  value={char.traits}
                  onChange={(e) => updateCharacter(char.id, 'traits', e.target.value)}
                  placeholder="角色特征描述..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {characters.length > 0 && (
        <div className="pt-4 border-t border-zinc-800 flex justify-end">
           <Button onClick={onNext} icon={ArrowRight}>确认角色并生成分镜</Button>
        </div>
      )}
    </div>
  );
};

const Step4Storyboard = ({ 
  shots, 
  setShots, 
  scriptData, 
  characters: _characters, 
  projectData 
 }: { 
  shots: Shot[], 
  setShots: (s: Shot[] | ((prev: Shot[]) => Shot[])) => void, 
  scriptData: ScriptScene[], 
  characters: Character[], 
  projectData: ProjectData 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStoryboard = async () => {
    setIsGenerating(true);
    try {
       const scriptContext = JSON.stringify(scriptData);
       // const charContext = characters.map(c => `${c.name}: ${c.traits}`).join('; '); // 预留角色上下文
       const systemPrompt = `Create shot list. Style: ${projectData.style}. Custom: ${projectData.customPrompt}.
       Return JSON: { "shots": [{ "id", "description", "shotType", "cameraMove", "audio", "tags" }] }`;

      const data = await callDeepSeek(systemPrompt, scriptContext);
      if (data.shots && Array.isArray(data.shots)) {
        setShots(data.shots.map((s: any) => ({ ...s, imgStatus: 'empty' })));
      }
    } catch (err) { alert("分镜生成失败"); } finally { setIsGenerating(false); }
  };

  // [新增] 单镜头图片生成
  const generateShotImage = (id: number) => {
    setShots(shots.map(s => s.id === id ? { ...s, imgStatus: 'generating' } : s));
    setTimeout(() => {
       setShots((prev: Shot[]) => prev.map((s: Shot) => s.id === id ? { ...s, imgStatus: 'done' } as Shot : s));
    }, 2500);
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
             icon={isGenerating ? Loader2 : Film} 
             onClick={generateStoryboard}
             disabled={isGenerating}
           >
             {isGenerating ? 'AI 规划镜头中...' : '生成分镜表'}
           </Button>
           <Button variant="primary" icon={Play} disabled={shots.length === 0}>全部生成</Button>
        </div>
      </div>

      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 grid grid-cols-12 gap-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
        <div className="col-span-1">序号</div>
        <div className="col-span-5">画面描述 (可编辑)</div>
        <div className="col-span-2">参数设置</div>
        <div className="col-span-2">台词</div>
        <div className="col-span-2 text-right">预览</div>
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
                    <option>特写 (Close Up)</option>
                    <option>中景 (Medium)</option>
                 </select>
                 <select className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 p-1.5 outline-none">
                    <option>{shot.cameraMove}</option>
                    <option>固定 (Static)</option>
                    <option>摇摄 (Pan)</option>
                 </select>
               </div>

               <div className="col-span-2">
                  <p className="text-xs text-zinc-500 italic">{shot.audio}</p>
               </div>

               <div className="col-span-2 flex justify-end">
                 <div 
                   onClick={() => generateShotImage(shot.id)}
                   className="w-28 h-16 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center relative overflow-hidden hover:border-blue-500 cursor-pointer transition-all"
                 >
                    {shot.imgStatus === 'done' ? (
                       <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                          <ImageIcon size={16} className="text-green-500" />
                       </div>
                    ) : shot.imgStatus === 'generating' ? (
                       <Loader2 className="animate-spin text-blue-500" size={16} />
                    ) : (
                       <>
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black"></div>
                        <div className="relative z-10 flex flex-col items-center gap-1">
                          <RefreshCw size={12} className="text-zinc-600" />
                          <span className="text-[9px] text-zinc-600">生成</span>
                        </div>
                       </>
                    )}
                 </div>
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

// --- Layout & Main ---

const Sidebar = ({ 
  currentStep, 
  setStep, 
  stepsStatus 
}: { 
  currentStep: StepType, 
  setStep: (s: StepType) => void,
  stepsStatus: Record<StepType, boolean>
}) => {
  const steps = [
    { id: 'project', icon: Settings, label: '项目设定' },
    { id: 'script', icon: BookOpen, label: '剧本生成' },
    { id: 'characters', icon: Users, label: '角色设计' },
    { id: 'storyboard', icon: Film, label: '分镜脚本' },
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col flex-shrink-0">
      <div className="p-6 flex items-center gap-3 text-white mb-6">
        <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
          <Clapperboard size={18} className="text-white" />
        </div>
        <h1 className="font-bold text-lg tracking-tight">AI Movie Studio</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isEnabled = stepsStatus[step.id as StepType];
          
          return (
            <button
              key={step.id}
              onClick={() => isEnabled && setStep(step.id as StepType)}
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

const TopBar = ({ currentStep: _currentStep, projectTitle }: { currentStep: string, projectTitle: string }) => {
  return (
    <div className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500">当前工程:</span>
        <span className="text-sm font-medium text-white bg-zinc-900 px-3 py-1 rounded border border-zinc-800 flex items-center gap-2">
           {projectTitle || '未命名项目'}
           <span className={`w-1.5 h-1.5 rounded-full ${projectTitle ? 'bg-green-500' : 'bg-zinc-500'}`}></span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={Save}>保存</Button>
        <Button variant="primary" icon={Upload}>导出项目</Button>
      </div>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState<StepType>('project');
  
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    style: 'anime',
    ratio: '16:9',
    customPrompt: '',
    negativePrompt: ''
  });
  const [novel, setNovel] = useState('');
  const [scriptData, setScriptData] = useState<ScriptScene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);

  const stepsStatus = {
    project: true,
    script: !!projectData.title,
    characters: scriptData.length > 0,
    storyboard: characters.length > 0,
  };

  const updateProjectData = (key: string, val: any) => {
    setProjectData(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="flex h-screen w-full bg-black text-zinc-200 font-sans selection:bg-blue-500/30">
      <Sidebar currentStep={step} setStep={setStep} stepsStatus={stepsStatus} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar currentStep={step} projectTitle={projectData.title} />
        
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
               />
             )}
             
             {step === 'characters' && (
               <Step3Characters 
                  characters={characters}
                  setCharacters={setCharacters}
                  scriptData={scriptData}
                  projectData={projectData}
                  onNext={() => setStep('storyboard')}
               />
             )}
             
             {step === 'storyboard' && (
               <Step4Storyboard 
                  shots={shots}
                  setShots={setShots}
                  scriptData={scriptData}
                  characters={characters}
                  projectData={projectData}
               />
             )}
           </div>
        </main>
      </div>
    </div>
  );
}
