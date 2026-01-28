const express = require('express');
const router = express.Router();

// In-memory database
const characterAssets = [];

// POST /api/characters
router.post('/', (req, res) => {
  const { scriptId } = req.body;

  if (!scriptId) {
    return res.status(400).json({ error: 'scriptId is required' });
  }

  // Simulate character extraction and asset generation from the script
  const generatedAssets = [
    {
      characterId: "char_01",
      version: "v1.0",
      characterSheet: {
        name: "林凡",
        age: 18,
        bodyType: "slim",
        hair: "black short hair",
        outfit: "school uniform",
        personality: ["calm", "determined"],
        signature: "left wrist bracelet"
      },
      anchors: {
        hair: "black short hair",
        outfit: "school uniform",
      },
      referenceImages: [
        { "url": "/placeholder/char01_front.jpg", "view": "front" },
        { "url": "/placeholder/char01_side.jpg", "view": "side" },
        { "url": "/placeholder/char01_happy.jpg", "expression": "happy" },
      ],
      status: "locked"
    },
    {
      characterId: "char_02",
      version: "v1.0",
      characterSheet: {
        name: "神秘人",
        age: 35,
        bodyType: "average",
        hair: "long dark hair",
        outfit: "black cloak",
        personality: ["mysterious", "menacing"],
        signature: "a silver ring"
      },
      anchors: {
        outfit: "black cloak",
        face: "a scar over the right eye"
      },
      referenceImages: [
         { "url": "/placeholder/char02_front.jpg", "view": "front" },
      ],
      status: "draft"
    }
  ];

  characterAssets.push(...generatedAssets);
  console.log('Generated new character assets for script:', scriptId);

  res.status(201).json(generatedAssets);
});

module.exports = router;
