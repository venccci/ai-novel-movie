import { useState, useEffect } from 'react';

const Step3_CharacterDesign = () => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatingCharId, setGeneratingCharId] = useState<string | null>(null);

  // Simulate fetching extracted characters when the component mounts
  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);
      // In a real app, you'd fetch this based on the script from Step 2
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      const extractedChars = [
        { id: 'char_01', name: '林凡', roleType: '主角', mentions: 42, sheet: null, visuals: [] },
        { id: 'char_02', name: '神秘人', roleType: '配角', mentions: 15, sheet: null, visuals: [] },
      ];
      setCharacters(extractedChars);
      setIsLoading(false);
    };
    fetchCharacters();
  }, []);

  const handleGenerateVisuals = async (charId: string) => {
    setGeneratingCharId(charId);
    console.log(`Generating visuals for character ${charId}`);
    
    try {
         const response = await fetch('/api/characters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Assuming we have a scriptId from the previous step
            body: JSON.stringify({ scriptId: 'script_v1' }), 
        });

        if (!response.ok) throw new Error('Failed to generate character assets');

        const assets = await response.json();
        const characterAsset = assets.find((asset: any) => asset.characterId === charId);

        if (characterAsset) {
            setCharacters(prev => prev.map(char => 
                char.id === charId 
                ? { ...char, sheet: characterAsset.characterSheet, visuals: characterAsset.referenceImages }
                : char
            ));
        }

    } catch (error) {
        console.error(error);
        alert('角色视觉生成失败!');
    } finally {
        setGeneratingCharId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">第三步：角色设计 & 资产库</h2>

      {isLoading && <p>正在从剧本中抽取角色...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {characters.map((char) => (
          <div key={char.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-text-primary">{char.name}</h3>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${char.roleType === '主角' ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>{char.roleType}</span>
              </div>
              <span className="text-sm text-gray-500">提及次数: {char.mentions}</span>
            </div>

            <div className="space-y-4 flex-grow">
              <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
                <h4 className="font-semibold mb-2">角色设定卡</h4>
                {char.sheet ? (
                  <div className="text-xs text-gray-700 space-y-1">
                    <p><b>外形:</b> {char.sheet.hair}, {char.sheet.bodyType}</p>
                    <p><b>服装:</b> {char.sheet.outfit}</p>
                    <p><b>性格:</b> {char.sheet.personality.join(', ')}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">点击下方按钮生成...</p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-md min-h-[160px]">
                <h4 className="font-semibold mb-2">角色视觉</h4>
                {char.visuals.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {char.visuals.map((vis: any, i: number) => (
                      <div key={i} className="bg-gray-300 h-24 rounded-md flex items-center justify-center text-center p-1">
                        <span className="text-xs text-gray-600">{vis.view || vis.expression}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                   <p className="text-xs text-gray-500">点击下方按钮生成...</p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => handleGenerateVisuals(char.id)}
              disabled={generatingCharId === char.id}
              className="w-full mt-4 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none disabled:bg-gray-400"
            >
              {generatingCharId === char.id ? '生成中...' : '生成/重新生成视觉'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step3_CharacterDesign;
