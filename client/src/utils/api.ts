// API Configuration
// @ts-ignore
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "sk-075617a0a1f5483fa2abe0b061b56e5f";
const API_URL = "https://api.deepseek.com/chat/completions";

export const callDeepSeek = async (systemPrompt: string, userPrompt: string) => {
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