const express = require('express');
const router = express.Router();

// POST /api/shotlists
router.post('/', (req, res) => {
  const { scriptId } = req.body;

  if (!scriptId) {
    return res.status(400).json({ error: 'scriptId is required' });
  }

  // Simulate ShotList generation
  const generatedShotList = [
    {
      shotId: "shot_01",
      sceneId: "scene_01",
      order: 1,
      characters: ["char_01"],
      camera: { shotSize: "特写", move: "静止", angle: "平视" },
      composition: { layout: "单人", focus: "char_01" },
      action: "主角惊讶地睁大了眼睛",
      emotion: "惊讶",
      dialogueRef: ["dlg-01"],
      durationSec: 2.5,
      imagePrompt: "Close-up of a surprised young man in a school uniform, anime style, expressive eyes, detailed facial features. He discovers a glowing book in a dark library.",
      flags: ["key_shot"]
    },
    {
      shotId: "shot_02",
      sceneId: "scene_01",
      order: 2,
      characters: ["char_01", "char_02"],
      camera: { shotSize: "中景", move: "静止", angle: "平视" },
      composition: { layout: "双人", focus: "char_02" },
      action: "神秘人出现在主角身后",
      emotion: "紧张",
      dialogueRef: ["dlg-02"],
      durationSec: 4.2,
      imagePrompt: "Medium shot of two characters in a dark library. A mysterious person in a black cloak stands behind the surprised young man. Tense atmosphere, dramatic lighting, anime style.",
      flags: []
    },
     {
      shotId: "shot_03",
      sceneId: "scene_02",
      order: 3,
      characters: ["char_01"],
      camera: { shotSize: "全景", move: "跟拍", angle: "平视" },
      composition: { layout: "单人", focus: "char_01" },
      action: "主角在雨夜的街道上奔跑",
      emotion: "恐慌",
      dialogueRef: [],
      durationSec: 5.0,
      imagePrompt: "Full shot of a young man running frantically through a rainy, neon-lit city street at night. Reflections on wet pavement, sense of motion, anime style.",
      flags: ["establishing_shot"]
    }
  ];

  console.log('Generated new shotlist for script:', scriptId);
  res.status(201).json(generatedShotList);
});

module.exports = router;
