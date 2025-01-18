import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app, server } from './server'; // Ensure server.js exports the app
import User from './models/User.js'; // Ensure you have the correct path to the User model
import Topic from './models/Topic.js'; // Ensure you have the correct path to the Topic model

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay to ensure connection

  // Ensure test user does not already exist
  await User.deleteOne({ email: 'testuser@example.com' });

  // Ensure test topic exists
  const topic = await Topic.findOne({ name: 'Test Topic' });
  if (!topic) {
    await new Topic({ name: 'Test Topic' }).save();
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close(); // Close the server after tests
});

describe('Server Endpoints', () => {
  it('should connect to MongoDB', async () => {
    const connectionState = mongoose.connection.readyState;
    expect(connectionState).toBe(1); // 1 means connected
  });

  it('should respond to GET /api/blogs', async () => {
    const response = await request(app).get('/api/blogs');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should respond to GET /api/topics', async () => {
    const response = await request(app).get('/api/topics');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should respond to POST /api/auth/login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'adiarprrr23@gmail.com', password: '123456' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should respond to POST /api/auth/signup', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ username: 'testuser', email: 'testuser@example.com', password: 'testpassword' });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  it('should create a new blog post', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'testpassword' });
    const token = loginResponse.body.token;

    const response = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Blog',
        content: 'This is a test blog post.',
        topicId: '60d0fe4f5311236168a109cb', // Replace with a valid topic ID
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
  });

  it('should delete a blog post', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'testpassword' });
    const token = loginResponse.body.token;

    const createResponse = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Blog to Delete',
        content: 'This blog post will be deleted.',
        topicId: '60d0fe4f5311236168a109cb', // Replace with a valid topic ID
      });
    const blogId = createResponse.body._id;

    const deleteResponse = await request(app)
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toHaveProperty('message', 'Blog deleted');
  });
});