import { useState } from 'react';
import { 
  Film, 
  Play, 
  Clock, 
  ZoomIn, 
  Star, 
  Lock, 
  Unlock,
  Camera,
  Users,
  AlertCircle
} from 'lucide-react';

const Step4_DirectorScript = () => {
  const [shotList, setShotList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedShot, setExpandedShot] = useState<string | null>(null);

  const handleGenerateShotList = async () => {
    setIsLoading(true);
    setShotList([]);
    
    try {
      const response = await fetch('/api/shotlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: 'script_v1' }),
      });

      if (!response.ok) throw new Error('Failed to generate shot list');

      const data = await response.json();
      setShotList(data);

    } catch (error) {
      console.error(error);
      alert('导演脚本生成失败!');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShotExpansion = (shotId: string) => {
    setExpandedShot(expandedShot === shotId ? null : shotId);
  };

  const getShotSizeColor = (shotSize: string) => {
    switch (shotSize) {
      case '特写': return 'bg-pink-100 text-pink-800';
      case '近景': return 'bg-purple-100 text-purple-800';
      case '中景': return 'bg-blue-100 text-blue-800';
      case '全景': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">镜头级导演脚本生成</h2>
        <p className="text-gray-600 mt-2">根据剧本和角色设计，生成可执行的镜头级导演脚本</p>
      </div>
      
      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-text-primary">导演脚本生成</h3>
            <p className="text-sm text-gray-500 mt-1">基于剧本结构自动生成镜头拆分和摄影指导</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>校验规则</span>
            </button>
            <button
              onClick={handleGenerateShotList}
              disabled={isLoading}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>{isLoading ? "生成中..." : "生成导演脚本"}</span>
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总镜头数</p>
                <p className="text-2xl font-semibold text-text-primary mt-1">
                  {shotList.length}
                </p>
              </div>
              <Film className="w-8 h-8 text-gray-300" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">预估总时长</p>
                <p className="text-2xl font-semibold text-text-primary mt-1">
                  {shotList.reduce((sum, shot) => sum + shot.durationSec, 0).toFixed(1)}s
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-300" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">涉及角色</p>
                <p className="text-2xl font-semibold text-text-primary mt-1">
                  {[...new Set(shotList.flatMap(shot => shot.characters))].length}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-300" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">关键镜头</p>
                <p className="text-2xl font-semibold text-text-primary mt-1">
                  {shotList.filter(shot => shot.flags?.includes('key_shot')).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Shot List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-text-primary">镜头列表</h3>
          <div className="text-sm text-gray-500">
            {shotList.length > 0 ? `${shotList.length}个镜头` : '暂无镜头'}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">正在生成导演脚本...</p>
          </div>
        ) : shotList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shotList.map((shot) => (
              <div 
                key={shot.shotId}
                className={`border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow ${
                  expandedShot === shot.shotId ? 'ring-2 ring-primary/20' : ''
                } ${shot.flags?.includes('key_shot') ? 'border-primary/30' : ''}`}
              >
                {/* Shot Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{shot.shotId}</h4>
                        <p className="text-xs text-gray-500">场景 {shot.sceneId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {shot.flags?.includes('key_shot') && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <button
                        onClick={() => toggleShotExpansion(shot.shotId)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <ZoomIn className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Shot Content */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">景别</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getShotSizeColor(shot.camera.shotSize)}`}>
                        {shot.camera.shotSize}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">动作描述</p>
                      <p className="text-sm font-medium text-gray-900">{shot.action}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">时长</p>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{shot.durationSec}s</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">情绪</p>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          {shot.emotion}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">涉及角色</p>
                      <div className="flex flex-wrap gap-1">
                        {shot.characters.map((char: string) => (
                          <span key={char} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedShot === shot.shotId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">AI生成提示词</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{shot.imagePrompt}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <button className="text-xs px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20">
                            标记关键
                          </button>
                          <button className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                            {shot.flags?.includes('locked') ? (
                              <>
                                <Unlock className="w-3 h-3 inline mr-1" />
                                解锁
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 inline mr-1" />
                                锁定
                              </>
                            )}
                          </button>
                        </div>
                        <button className="text-xs text-gray-500 hover:text-gray-700">
                          编辑参数
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
            <Film className="w-12 h-12 text-gray-300 mx-auto" />
            <h4 className="text-lg font-medium text-gray-700 mt-4">尚未生成导演脚本</h4>
            <p className="text-gray-500 mt-2">点击上方按钮开始生成镜头级导演脚本</p>
            <button
              onClick={handleGenerateShotList}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 inline-flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>开始生成</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4_DirectorScript;
