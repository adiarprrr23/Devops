import express from 'express';
import Topic from '../models/Topic.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find().sort('name');
    res.json(topics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const topic = new Topic({ name, description });
    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;