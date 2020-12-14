const blogsRouter = require('express').Router();
const Blog = require('../models/blog');


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  blogs.forEach(blog => {
    if (!blog.likes) {
      blog.likes = 0;
    }
  });
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body);

  const savedBlog = await blog.save();
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
  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

module.exports = blogsRouter;
