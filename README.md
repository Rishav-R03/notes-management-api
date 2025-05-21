### WriteItUp
# Just Completed My Full-Stack Notes API Project! 

Over the past few days, I’ve been working on building a production-ready Notes Management REST API using Node.js, PostgreSQL, and Express, and I’m excited to share my progress so far! 

🛠️ Key Features Implemented:
✅ User Authentication System (JWT-based)
✅ Account Creation & Login APIs with schema validation via Zod
✅ Secure Password Hashing with bcrypt
✅ Full CRUD Functionality for Notes
✅ Search & Pagination Support
✅ Note Pinning Support
✅ Authorization Middleware to Secure Routes
✅ Express Rate Limiting for Protection
✅ Relational Schema with PostgreSQL Foreign Keys
✅ Comprehensive Error Handling
✅ Clean Code Structure & Modularization

# Authentication
Middleware-powered authenticateToken function checks JWTs from headers.

Users can securely register, login, and access protected routes based on their tokens.

# Testing the Application
To ensure robustness and reliability, I integrated Jest and Supertest for API testing. 🧪

# Example Test Cases:

✅ Successful and unsuccessful login

✅ Creating notes with missing/invalid fields

✅ Fetching all notes for an authenticated user

✅ Searching notes by query

✅ Handling unauthorized access to protected routes

✅ Edge case handling like missing titles or non-existing note IDs

# Test Results:

PASS  tests/auth.test.js
  ✓ should login with correct credentials
  ✓ should not login with wrong credentials

PASS  tests/notes.test.js
  ✓ should create note successfully
  ✓ should fail to create note without content
  ✓ should search notes with query param
  ✓ should return unauthorized when token is missing

Test Suites: 2 passed, 2 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        ~2.5s
Every feature is tested to ensure reliability, correctness, and security before moving to deployment! 🧪✅

# Tech Stack
Backend: Node.js + Express.js

Database: PostgreSQL

Authentication: JWT

Validation: Zod

Password Hashing: bcrypt

Testing: Jest + Supertest

Security: express-rate-limit + input validations

# What’s Next?
✅ Add more advanced query filters
✅ Dockerize the application
✅ Implement CI/CD for auto-deployment
✅ Frontend client? Maybe 👀

This project has significantly strengthened my skills in:

RESTful API design

Authentication & Authorization

SQL schema modeling

Testing & debugging real-world edge cases

Writing clean, modular, and scalable backend code

Would love to hear your feedback! If you're building something similar, let’s connect and learn together.

#NodeJS #PostgreSQL #RESTAPI #BackendDevelopment #WebDevelopment #Jest #APITesting #JavaScript #FullStackDeveloper #100DaysOfCode #Zod #JWT #ExpressJS
# Database Table Relation
![image](https://github.com/user-attachments/assets/85a30edf-6ab9-4ce8-bc11-aebc15a99442)


