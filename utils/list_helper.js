const totalLikes = (blogs) => {
  return blogs.length === 0
    ? 0
    : blogs.map(blog => blog.likes)
      .filter(Number)
      .reduce((totalLikes, likes) => totalLikes + likes);
};

// const average = (array) => {
//   const reducer = (sum, item) => {
//     return sum + item;
//   };

//   return array.length === 0
//     ? 0
//     : array.reduce(reducer, 0) / array.length;
// };


module.exports = {
  totalLikes
};
