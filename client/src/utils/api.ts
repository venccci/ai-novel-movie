const API_KEY = (import.meta.env.VITE_DEEPSEEK_API_KEY || "").trim();
const API_URL = "https://api.deepseek.com/chat/completions";

const ensureApiKey = () => {
  if (!API_KEY || API_KEY.includes("your-valid-deepseek-api-key-here")) {
    throw new Error(
      "未配置 DeepSeek API Key。请在 client/.env 中设置 VITE_DEEPSEEK_API_KEY，并重启前端服务。"
    );
  }
};

const getApiErrorMessage = async (response: Response) => {
  const rawText = await response.text();
  try {
    const parsed = JSON.parse(rawText);
    const message = parsed?.error?.message;
    const type = parsed?.error?.type;
    if (type === "authentication_error") {
      return "DeepSeek 鉴权失败：API Key 无效或已过期。请更新 client/.env 中的 VITE_DEEPSEEK_API_KEY。";
    }
    if (message) return message;
  } catch {
    // Use raw response text fallback when the server does not return JSON.
  }
  return rawText;
};

export const callDeepSeek = async (systemPrompt: string, userPrompt: string) => {
  ensureApiKey();

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
    const errorMessage = await getApiErrorMessage(response);
    console.error("API Error Response:", errorMessage);
    throw new Error(`API Request failed: ${response.status} - ${errorMessage}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  // Clean markdown code blocks if AI wraps JSON in them
  content = content.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(content);
};
