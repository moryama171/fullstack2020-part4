const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const { initialBlogs } = require('./test_helper');
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

  test('a new blog can be added', async (done) => {
    await api
      .post('/api/blogs')
      .send(helper.newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);

    const titles = blogsAtEnd.map(b => b.title);
    expect(titles).toContain(helper.newBlog.title);
    done();
  });

  test('default likes property to 0 when missing', async (done) => {
    const response = await api.get('/api/blogs');

    response.body.map(blog => expect(blog.likes).toBeDefined());
    done();
  });

});

afterAll(() => {
  mongoose.connection.close();
});