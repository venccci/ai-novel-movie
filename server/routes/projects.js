const express = require('express');
const router = express.Router();

// In-memory database
const projects = [];
let projectIdCounter = 1;

// GET /api/projects - 获取所有项目
router.get('/', (req, res) => {
  res.json(projects);
});

// GET /api/projects/:id - 获取单个项目
router.get('/:id', (req, res) => {
  const project = projects.find(p => p.id == req.params.id);
  if (!project) return res.status(404).json({ error: '项目不存在' });
  res.json(project);
});

// POST /api/projects - 创建新项目
router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: '项目标题必填' });
  }
  const newProject = {
    id: String(projectIdCounter++),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectData: { title, style: 'anime', ratio: '16:9', customPrompt: '', negativePrompt: '' },
    novel: '',
    scriptData: [],
    characters: [],
    shots: []
  };
  projects.push(newProject);
  console.log('创建新项目:', newProject);
  res.status(201).json(newProject);
});

// PUT /api/projects/:id - 更新项目
router.put('/:id', (req, res) => {
  const project = projects.find(p => p.id == req.params.id);
  if (!project) return res.status(404).json({ error: '项目不存在' });
  Object.assign(project, req.body);
  project.updatedAt = new Date().toISOString();
  console.log('更新项目:', project);
  res.json(project);
});

// DELETE /api/projects/:id - 删除项目
router.delete('/:id', (req, res) => {
  const index = projects.findIndex(p => p.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: '项目不存在' });
  projects.splice(index, 1);
  console.log('删除项目:', req.params.id);
  res.status(204).send();
});

module.exports = router;
