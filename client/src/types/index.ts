// 项目核心类型定义

export type StepType = 'project' | 'script' | 'characters' | 'storyboard';

export interface ProjectData {
  title: string;
  style: string;
  ratio: string;
  customPrompt: string; // 自定义正向提示词
  negativePrompt: string; // 自定义负向提示词
}

export interface ScriptScene {
  id: number;
  location: string;
  time: string;
  characters: string;
  description: string;
}

export interface Character {
  id: number;
  name: string;
  role: string;
  appearance: string;
  background: string;
  status: 'ready' | 'generating' | 'pending';
  img: string | null;
}

export interface Shot {
  id: number;
  description: string;
  shotType: string;
  cameraMove: string;
  audio: string;
  tags: string[];
  prompt: string;
  imgStatus?: 'empty' | 'generating' | 'done'; // 图片生成状态
}

// AI 任务类型
export interface AITask {
  id: string;
  type: 'script' | 'characters' | 'storyboard' | 'image';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description: string;
  result?: any;
  error?: string;
}

// API 响应类型
export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// 步骤状态类型
export interface StepsStatus {
  project: boolean;
  script: boolean;
  characters: boolean;
  storyboard: boolean;
}

 // 项目工程类型
 export interface Project {
   id: string;
   title: string;
   createdAt: string;
   updatedAt: string;
   projectData?: ProjectData;
   novel?: string;
   scriptData?: ScriptScene[];
   characters?: Character[];
   shots?: Shot[];
 }

 // UI 组件 Props 类型
 export interface StepComponentProps {
  // Step 1
  data?: ProjectData;
  updateData?: (key: string, val: any) => void;
  
  // Step 2
  novel?: string;
  setNovel?: (s: string) => void;
  scriptData?: ScriptScene[];
  setScriptData?: (data: ScriptScene[]) => void;
  
  // Step 3
  characters?: Character[];
  setCharacters?: (c: Character[] | ((prev: Character[]) => Character[])) => void;
  
  // Step 4
  shots?: Shot[];
  setShots?: (s: Shot[] | ((prev: Shot[]) => Shot[])) => void;
  
  // 通用
  projectData?: ProjectData;
  onNext?: () => void;
}