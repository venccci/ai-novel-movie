import { Eye, FileText, Film, Users } from 'lucide-react';

const PreviewPanel = () => {
  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">工作状态</h2>
          <Eye className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">剧本生成</p>
                <p className="text-xs text-gray-500">已完成</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-cta/10 text-cta text-xs font-medium rounded-full">锁定</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">角色设计</p>
                <p className="text-xs text-gray-500">进行中</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">待审核</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Film className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">导演脚本</p>
                <p className="text-xs text-gray-500">待开始</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">未锁定</span>
          </div>
        </div>
      </div>

      {/* Data Preview Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">数据预览</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">剧本信息</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">《神秘图书馆》第1集</p>
              <p className="text-xs text-gray-500 mt-1">3个场景 · 12句对白 · 预估时长 75秒</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">角色统计</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium">主要角色</p>
                <p className="text-lg font-semibold text-blue-900">2</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-700 font-medium">提及次数</p>
                <p className="text-lg font-semibold text-green-900">57</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
