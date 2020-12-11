const app = require('./app');
// const http = require('http');

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});