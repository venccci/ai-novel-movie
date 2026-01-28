const express = require('express');
const router = express.Router();

// In-memory database
const projects = [];
const style_profiles = [];
let projectIdCounter = 1;
let styleProfileIdCounter = 1;

// POST /api/projects
router.post('/', (req, res) => {
  const {
    name,
    description,
    targetPlatform,
    language,
    visual,
    narrative,
    aiConstraints
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  // Create new project
  const newProject = {
    id: projectIdCounter++,
    name,
    description,
    target_platform: targetPlatform,
    language,
    status: 'Draft',
    created_at: new Date().toISOString()
  };
  projects.push(newProject);

  // Create new style profile
  const newStyleProfile = {
    id: styleProfileIdCounter++,
    project_id: newProject.id,
    version: 'v1.0',
    visual_specs: visual,
    narrative_specs: narrative,
    ai_constraints: aiConstraints,
    created_at: new Date().toISOString()
  };
  style_profiles.push(newStyleProfile);

  console.log('Created new project:', newProject);
  console.log('Created new style profile:', newStyleProfile);

  res.status(201).json({ project: newProject, styleProfile: newStyleProfile });
});

module.exports = router;
