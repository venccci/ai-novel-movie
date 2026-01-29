import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { ProjectData } from '../types';
import { Button, InputGroup } from '../components/ui';

interface Step1ProjectStyleProps {
  data: ProjectData;
  updateData: (key: string, val: any) => void;
  onNext: () => void;
}

const Step1ProjectStyle: React.FC<Step1ProjectStyleProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const styles = [
    { id: 'anime', name: '日式动漫', desc: '色彩鲜艳，线条清晰', color: 'from-pink-500 to-rose-500' },
    { id: 'pixar', name: '3D 动画', desc: '皮克斯/迪士尼风格', color: 'from-blue-500 to-cyan-500' },
    { id: 'cyberpunk', name: '赛博朋克', desc: '高对比度，霓虹光感', color: 'from-purple-500 to-indigo-500' },
    { id: 'sketch', name: '黑白素描', desc: '手绘艺术风格', color: 'from-zinc-500 to-gray-500' },
  ];

  const ratios = ['16:9', '9:16', '1:1', '2.35:1'];

  return (
    <div className="h-full flex flex-col">
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
        <Button onClick={onNext} disabled={!data.title || !data.style || !data.ratio} icon={ArrowRight}>
           确认设定并进入下一步
        </Button>
      </div>
    </div>
  );
};

export default Step1ProjectStyle;