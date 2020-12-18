const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helper = require('./test_helper');

const api = supertest(app);
let authHeader;

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  // Create a user
  const passwordHash = await bcrypt.hash('abcdef', 10);
  const newUser = new User({
    username: 'user',
    passwordHash
  });
  const user = await newUser.save();
  const userForToken = {
    username: user.username,
    id: user._id
  };
  const token = jwt.sign(userForToken, process.env.SECRET);
  authHeader = `bearer ${token}`;

  // Populate database with blogs
  const initialBlogs = await helper.initialBlogs;
  initialBlogs.forEach(blog => blog.user = user._id);
  const blogObjects = initialBlogs.map(function (blog) {
    return new Blog(blog);
  });
  const promiseArray = blogObjects.map(blog => blog.save());
  await Promise.all(promiseArray);
});

describe('when there are some blogs saved', () => {
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

  test('default "likes" property to 0 when missing', async (done) => {
    const response = await api.get('/api/blogs');

    response.body.map(blog => expect(blog.likes).toBeDefined());
    done();
  });

});

describe('addition of a new blog', () => {
  test('a new blog can be added', async (done) => {
    const newBlog = {
      title: 'new blog',
      url: 'http://www.example.com'
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', authHeader)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

    const titles = blogsAtEnd.map(b => b.title);
    expect(titles).toContain(newBlog.title);
    done();
  });

  test('fails with status code 401 when token is not provided', async (done) => {
    const blogsAtStart = await helper.blogsInDb();

    await api
      .post('/api/blogs')
      .send(helper.newBlog)
      .expect(401);
    done();

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
  });

  test('fails with status code 400 when "title" and "url" missing', async (done) => {
    const incompleteBlog = {
      author: 'Hoffmann',
      likes: 24
    };

    await api
      .post('/api/blogs')
      .send(incompleteBlog)
      .set('Authorization', authHeader)
      .expect(400);
    done();
  });

});

describe('update of a blog', () => {
  test('successfully updates the number of likes of a specific blog', async () => {
    const blogsBeforeUpdate = await helper.blogsInDb();
    const blogToUpdate = blogsBeforeUpdate[0];

    const likesBeforeUpdate = blogToUpdate.likes;
    blogToUpdate.likes += 1;

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200);

    const blogsAfterUpdate = await helper.blogsInDb();
    const updatedBlog = blogsAfterUpdate.filter(blog => blog.id == blogToUpdate.id)[0];
    expect(updatedBlog.likes).toBe(likesBeforeUpdate + 1);
  });
});

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async (done) => {
    const blogsBeforeDeletion = await helper.blogsInDb();
    const blogToDelete = blogsBeforeDeletion[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', authHeader)
      .expect(204);
    done();

    const blogsAfterDeletion = await helper.blogsInDb();
    expect(blogsAfterDeletion).toHaveLength(blogsBeforeDeletion.length - 1);

    const titles = blogsAfterDeletion.map(blog => blog.title);
    expect(titles).not.toContain(blogToDelete.title);
  });

});

afterAll(() => {
  mongoose.connection.close();
});