import request from 'supertest';
import app from '../index.js'; // Your Express app
import conn from '../db.js'; // Your DB connection
let token = '';


beforeAll(async () => {
  const res = await request(app).post('/login').send({
    email: 'testuser@example.com',
    password: 'test1234',
  });
  token = res.body.token;
});

it('should add a note', async () => {
  const res = await request(app)
    .post('/add-note')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Test Note',
      content: 'This is a test note',
    });

  expect(res.statusCode).toBe(201);
  expect(res.body.title).toBe('Test Note');
});
