var _ = require('lodash');

const totalLikes = (blogs) => {
  return blogs.length === 0
    ? 0
    : blogs.map(blog => blog.likes)
      .filter(Number)
      .reduce((totalLikes, likes) => totalLikes + likes);
};

const favoriteBlog = (blogs) => {

  if (blogs.length === 0) {
    return undefined;
  }

  const listOfLikes = blogs.map(blog => blog.likes);
  const mostLikedBlog = blogs[
    listOfLikes.indexOf(
      Math.max(...listOfLikes)
    )
  ];
  return {
    'title': mostLikedBlog.title,
    'author': mostLikedBlog.author,
    'likes': mostLikedBlog.likes
  };
};

const mostBlogs = (blogs) => {

  if (blogs.length === 0) {
    return undefined;
  }

  let authorWithMostBlogs = null;

  // Collect number of blogs for each author
  const blogsByAuthor = {};
  blogs.forEach(blog => {
    const author = blog.author;
    !blogsByAuthor[author]
      ? blogsByAuthor[author] = 1
      : blogsByAuthor[author] += 1;
  });

  // Find max number of blogs in collection
  const numberOfBlogs = Object.values(blogsByAuthor);
  const maxBlogs = Math.max(...numberOfBlogs);

  authorWithMostBlogs = Object.keys(blogsByAuthor).find(author => blogsByAuthor[author] === maxBlogs);

  return {
    author: authorWithMostBlogs,
    blogs: maxBlogs
  };
};

const mostLikes = (blogs) => {

  if (blogs.length === 0) {
    return undefined;
  }

  let authorWithMostLikes = null;

  const likesByAuthor = {};
  blogs.forEach(blog => {
    const author = blog.author;
    !likesByAuthor[author]
      ? likesByAuthor[author] = blog.likes
      : likesByAuthor[author] += blog.likes;
  });

  const numberOfLikes = Object.values(likesByAuthor);
  const maxLikes = Math.max(...numberOfLikes);

  authorWithMostLikes = Object.keys(likesByAuthor).find(author => likesByAuthor[author] === maxLikes);

  return {
    author: authorWithMostLikes,
    likes: maxLikes
  };
};


module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};
