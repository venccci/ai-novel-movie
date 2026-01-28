const express = require('express');
const router = express.Router();

// In-memory database
const scripts = [];
let scriptIdCounter = 1;

// POST /api/scripts
router.post('/', (req, res) => {
  const { novelText, projectId } = req.body;

  if (!novelText || !projectId) {
    return res.status(400).json({ error: 'novelText and projectId are required' });
  }

  // Simulate script generation
  const generatedScript = {
    scriptId: `script_v${scriptIdCounter++}`,
    projectId: projectId,
    scenes: [
      {
        sceneId: "scene-01",
        location: "古老的图书馆",
        time: "夜晚",
        characters: ["char_01"],
        summary: "主角发现一本神秘的书。"
      },
      {
        sceneId: "scene-02",
        location: "街道",
        time: "夜晚",
        characters: ["char_01", "char_02"],
        summary: "主角被神秘人追赶。"
      }
    ],
    dialogues: [
       {
        lineId: "dlg-01",
        speaker: "char_01",
        text: "这本书...它在发光！",
        emotion: "惊讶",
        type: "dialogue"
      },
      {
        lineId: "dlg-02",
        speaker: "char_02",
        text: "站住！把书交出来！",
        emotion: "愤怒",
        type: "dialogue"
      }
    ],
    narrations: [
        {
            narrationId: "nar-01",
            text: "月光下，城市的阴影似乎活了过来。"
        }
    ],
    characters_mentioned: ["char_01", "char_02"],
    meta: {
      pace: "fast",
      estimatedDuration: 75
    },
    created_at: new Date().toISOString()
  };

  scripts.push(generatedScript);
  console.log('Generated new script:', generatedScript);

  res.status(201).json(generatedScript);
});

module.exports = router;
