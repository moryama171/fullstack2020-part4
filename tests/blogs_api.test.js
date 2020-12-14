const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');
const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog));
  const promiseArray = blogObjects.map(blog => blog.save());
  await Promise.all(promiseArray);
});

describe('blogs api', () => {

  test('blogs are returned as json', async (done) => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    done();
  });

  test('all blogs are returned', async (done) => {
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(helper.initialBlogs.length);
    done();
  });

  test('the unique identifier of a blog post is named "id"', async (done) => {
    const response = await api.get('/api/blogs');

    const ids = response.body.map(blog => blog.id);
    ids.map(id => expect(id).toBeDefined());
    done();
  });

});

afterAll(() => {
  mongoose.connection.close();
});