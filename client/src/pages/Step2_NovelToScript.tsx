import { useState } from 'react';

const Step2_NovelToScript = () => {
  const [novelText, setNovelText] = useState('');
  const [generatedScript, setGeneratedScript] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateScript = async () => {
    if (!novelText.trim()) {
      alert('请输入小说原文！');
      return;
    }
    setIsLoading(true);
    setGeneratedScript(null);
    console.log("Generating script from novel text:", novelText);

    try {
       const response = await fetch('/api/scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Assuming we have a projectId from the previous step, hardcoding for now
        body: JSON.stringify({ novelText, projectId: 1 }), 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Script generated successfully:', result);
      setGeneratedScript(result);

    } catch (error) {
      console.error('Failed to generate script:', error);
      alert('剧本生成失败，请查看控制台获取更多信息。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">第二步：小说剧本生成</h2>

      {/* Novel Input Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-text-primary mb-4">小说原文</h3>
        <p className="text-sm text-gray-500 mb-4">将您的小说章节粘贴到下方，或上传文件。</p>
        <div className="space-y-4">
          <textarea
            id="novelText"
            rows={15}
            value={novelText}
            onChange={(e) => setNovelText(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="在这里粘贴小说文本..."
          />
          <div className="flex justify-between items-center">
             <div className="space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                上传 .txt 文件
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                上传 .docx 文件
                </button>
            </div>
            <button
              onClick={handleGenerateScript}
              disabled={isLoading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
            >
              {isLoading ? '生成中...' : '生成结构化剧本'}
            </button>
          </div>
        </div>
      </div>

      {/* Script Preview Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-text-primary mb-4">剧本预览</h3>
        <div className="bg-gray-50 p-4 rounded-md shadow-inner h-96 overflow-y-auto">
           <pre className="text-xs text-gray-700 whitespace-pre-wrap">
             <code>
              {generatedScript 
                ? JSON.stringify(generatedScript, null, 2) 
                : '// 结构化剧本将在这里显示...'}
              </code>
           </pre>
        </div>
      </div>
    </div>
  );
};

export default Step2_NovelToScript;
