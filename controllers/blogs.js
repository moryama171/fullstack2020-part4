const jwt = require('jsonwebtoken');
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1 });
  blogs.forEach(blog => {
    if (!blog.likes) {
      blog.likes = 0;
    }
  });
  response.json(blogs);
});


// Separate token from 'authorization' header
const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    return authorization.substring(7);
  }
  return null;
};

blogsRouter.post('/', async (request, response) => {
  const body = request.body;

  const token = getTokenFrom(request);
  if (!token) {
    return response.status(401).json({ error: 'token missing' });
  }
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return response.status(401).json({ error: 'invalid user' });
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    blog,
    { new: true }
  );
  response.json(updatedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
  const token = getTokenFrom(request);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return response.status(401).json({ error: 'invalid user' });
  }

  const blogToRemove = await Blog.findById(request.params.id);

  if (!blogToRemove) {
    return response.status(400).json({ error: 'requested item was already deleted' });
  }

  if (!(blogToRemove.user.toString() === user._id.toString())) {
    return response.status(403).json({ error: 'user not authorised' });
  }

  await blogToRemove.remove();
  response.status(204).end();

});

module.exports = blogsRouter;
