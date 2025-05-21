import request from 'supertest'
import app from '../index/js';
import conn from '../db.js'; 


describe('Auth Routes',()=>{
    afterAll(async ()=>{
        await conn.end();
    });
    it('should create account',async ()=>{
        const res = await request(app)
            .post('/createAccount')
            .send({
                name:"Test User",
                email:"testuser@example.com",
                password:'test1234',
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.user.email).toBe('testuser@example.com')
    })

    it('should log in and return a token', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'testuser@example.com',
        password: 'test1234',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
  
})