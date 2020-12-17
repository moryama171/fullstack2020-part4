const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');


usersRouter.get('/', async (request, response) => {
  const users = await User.find({});
  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const body = request.body;

  if (!(body.username && body.password)) {
    response.status(400).send({
      error: 'Provide both username and password'
    });
  }
  if (body.password.length() < 3) {
    response.status(400).send({
      error: 'Password must be minimum 3 characters'
    })
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User ({
    username: body.username, 
    passwordHash: passwordHash,
    name: body.name
  });

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

module.exports = usersRouter;