const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const helper = require('./test_helper');
const api = supertest(app);


beforeEach(async () => {
  await User.deleteMany();
  const userObjects = helper.initialUsers.map(user => new User(user));
  const promiseArray = userObjects.map(user => user.save());
  await Promise.all(promiseArray);
});

describe('when there are some users saved', () => {
  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
  test('user password is not returned', async () => {
    const response = await api
      .get('/api/users');
    expect(response.body).not.toContain('password');
  });
});

describe('addition of a new user', () => {
  test('a new user can be added', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'dudda',
      password: 'dudda',
      name: 'Dudda de Duddis'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(user => user.username);
    expect(usernames).toContain(newUser.username);
  });

  test('user is not created and returns appropriate status code and message when username is not provided', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      password: 'some password',
      name: 'some name'
    };

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    expect(response.body.error).toContain('Provide both username and password');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('user is not created and returns appropriate status code and message when password is not provided', async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: 'some username',
      name: 'some name'
    };
  
    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);
  
    const usersAtEnd = await helper.usersInDb();

    expect(response.body.error).toContain('Provide both username and password');

    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('user is not created and returns appropriate status code and message when username is shorter than minimum length', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'du',
      password: 'some password',
      name: 'some name'
    };

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    expect(response.body.error).toContain('is shorter than the minimum');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('user is not created and returns appropriate status code and message when password is shorter than minimum length', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'some username',
      password: 'du',
      name: 'some name'
    };

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    expect(response.body.error).toContain('Password must be minimum');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('user is not created and returns appropriate status code and message when username is not unique', async () => {
    const usersAtStart = await helper.usersInDb();
    const existingUsername = usersAtStart[0].username;

    const newUser = {
      username: existingUsername,
      password: 'some password',
      name: 'some name'
    };

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    expect(response.body.error).toContain('expected `username` to be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});