// Write your tests here
const server = require('./server');
const request = require('supertest');
const db = require('../data/dbConfig.js');
const jwtDecode = require('jwt-decode');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db('users').truncate();
  await db.seed.run();
});
afterAll(async () => {
  await db.destroy();
});


test('sanity', () => {
  expect(true).toBe(false)
})

it('process.env.NODE_ENV must be "testing"', () => {
  expect(process.env.NODE_ENV).toBe('testing');
});

describe('Auth endpoints', () => {
  describe('[POST] /api/auth/register', () => {
    let newUser;
    let res;
    beforeEach(async () => {
      res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'shrek', password: '12345' });
      newUser = await db('users').where('username', 'shrek').first();
    });
    it('registers a new user to the db', async () => {
      expect(newUser).toMatchObject({ username: 'shrek' });
    });
    it('returns different password than provided (hashed)', async () => {
      expect(newUser.password).not.toBe('12345');
    });
    it('returns a status 201', async () => {
      expect(res.status).toBe(201);
    });
  });
  describe('[POST] /api/auth/login', () => {
    it('returns message on valid credentials', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'Guy', password: '1234' });
      expect(res.body.message).toMatch(`welcome, Guy`);
    }, 500);
    it('returns token on valid login', async () => {
      let res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'Guy', password: '1234' });
      let decoded = jwtDecode(res.body.token);
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toMatchObject({
        subject: 1,
        username: 'Guy',
      });
      res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'Guyguy', password: '1234' });
      decoded = jwtDecode(res.body.token);
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toMatchObject({
        subject: 2,
        username: 'Guyguy',
      });
    }, 500);
  });
});

describe('Auth middleware', () => {
  describe('registerPayload', () => {
    it('responds with status 401 if username or password missing', async () => {
      const resMissingPass = await request(server).post('/api/auth/register').send({
        username: 'shrek',
      });
      const resMissingUser = await request(server).post('/api/auth/register').send({
        password: '1234',
      });
      expect(resMissingPass.status).toBe(401);
      expect(resMissingUser.status).toBe(401);
      expect(resMissingPass.body).toMatchObject({
        message: 'username and password required',
      });
      expect(resMissingUser.body).toMatchObject({
        message: 'username and password required',
      });
    }, 500);
    it('responds with username taken if taken', async () => {
      const res = await request(server).post('/api/auth/register').send({
        username: 'Guy',
        password: '12345',
      });
      expect(res.body).toMatchObject({ message: 'username taken' });
    }, 500);
  });
  describe('checkUsernameExists', () => {
    it('responds with 401 and invalid credentials message', async () => {
      const res = await request(server).post('/api/auth/login').send({
        username: 'nothing',
        password: '1234',
      });
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ message: 'invalid credentials' });
    }, 500);
  });
  describe('loginPayload', () => {
    it('responds with 401 if username or password are missing', async () => {
      const resMissingPass = await request(server).post('/api/auth/login').send({
        username: 'shrek',
      });
      const resMissingUser = await request(server).post('/api/auth/login').send({
        password: 'shrek',
      });
      expect(resMissingPass.status).toBe(401);
      expect(resMissingUser.status).toBe(401);
      expect(resMissingPass.body).toMatchObject({
        message: 'username and password required',
      });
      expect(resMissingUser.body).toMatchObject({
        message: 'username and password required',
      });
    }, 500);
  });
  describe('loginValidation', () => {
    it('responds with a 401 and invalid creds if username does not exist', async () => {
      const resFakeUser = await request(server).post('/api/auth/login').send({
        username: 'elvis',
        password: '12345',
      });

      expect(resFakeUser.status).toBe(401);
      expect(resFakeUser.body).toMatchObject({
        message: 'invalid credentials',
      });
    }, 500);
    it('responds with a 401 and invalid creds if password incorrect', async () => {
      const resWrongPass = await request(server).post('/api/auth/login').send({
        username: 'Guy',
        password: '123h12',
      });

      expect(resWrongPass.status).toBe(401);
      expect(resWrongPass.body).toMatchObject({
        message: 'invalid credentials',
      });
    });
  });
  describe('restricted', () => {
    it('responds with "token required" & 401 if missing', async () => {
      const res = await request(server).get('/api/jokes');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token required/i);
    });
    it('responds with "invalid token" if invalid', async () => {
      const res = await request(server).get('/api/jokes').set('Authorization', 'foobar');
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it('responds with jokes on valid token', async () => {
      let res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'Guy', password: '1234' });
      res = await request(server).get('/api/jokes').set('Authorization', res.body.token);
      console.log(res.body.length);
      expect(res.body.length).toBe(3);
    });
  });
});