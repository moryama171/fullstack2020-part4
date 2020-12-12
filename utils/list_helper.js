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
  const highestLike = Math.max(...listOfLikes);
  const mostLikedBlog = blogs[listOfLikes.indexOf(highestLike)];
  return {
    'title': mostLikedBlog.title,
    'author': mostLikedBlog.author,
    'likes': mostLikedBlog.likes
  };
};

module.exports = {
  totalLikes,
  favoriteBlog
};
