import express from 'express';
import Blog from '../models/Blog.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';


const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/', auth, upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, content, topicId } = req.body;
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : req.body.thumbnail;
    const blog = new Blog({
      title,
      content,
      author: req.user._id,
      topic: topicId,
      thumbnail,
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'username')
      .populate('topic', 'name')
      .sort('-createdAt');
    // console.log(blogs)
    res.json(blogs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username')
      .populate('topic', 'name');
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, content, topicId } = req.body;
    const blog = new Blog({
      title,
      content,
      author: req.user._id,
      topic: topicId
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    console.log('Route hit');
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
    .populate('author', 'username')
    .populate('topic', 'name');

    
    console.log(blog.views)
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const userLikedIndex = blog.likes.indexOf(req.user._id);
    
    if (userLikedIndex === -1) {
      // User hasn't liked the blog yet, add like
      blog.likes.push(req.user._id);
    } else {
      // User already liked the blog, remove like
      blog.likes.splice(userLikedIndex, 1);
    }

    await blog.save();
    
    const updatedBlog = await Blog.findById(blog._id)
      .populate('author', 'username')
      .populate('topic', 'name');
    
    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


export default router;