import { Bell, HelpCircle, Search, Sparkles, User } from 'lucide-react';

const TopNav = () => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">AI Novel Movie</h1>
                <p className="text-xs text-gray-500">小说 → 漫剧 智能生成平台</p>
              </div>
            </div>
            
            {/* Search bar */}
            <div className="hidden md:block relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="搜索项目或功能..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          
          {/* Right section */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cta rounded-full"></span>
            </button>
            
            {/* User profile */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">创作者</p>
                <p className="text-xs text-gray-500">免费版</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
