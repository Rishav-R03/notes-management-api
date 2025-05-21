import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import conn from './db.js'
import authenticateToken from './utilities.js'
import userSchema from './models/user.model.js'
import bcrypt from 'bcrypt'
import webToken from 'jsonwebtoken'
import ratelimit from 'express-rate-limit'
import helmet from 'helmet'

const app = express();
//db connection 

conn.connect()
    .then(()=>console.log(`db connected!`))
    .catch(err=>console.log('error connected with database!'))

// middlewares
app.use(helmet())
const limit = ratelimit({
  windowMs:10*60*1000,
  max:5,
  message:"Too many bad requests try again after 10 minutes!"
})

app.use(limit);
dotenv.config()
app.use(express.json())
app.use(morgan('dev'))
app.use(cors({
    origin:"*",
}))
//error handler 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Something broke!" });
});



//routes
// 1. default route
app.get("/",(req,res)=>{
    res.status(201).json({
        data:"Hello from homepage!"
    })
})

// 2. signup/ register new user
app.post('/createAccount',async (req,res)=>{
    //parse the user details
    try {
    // Validate request body
    const { name, email, password } = userSchema.parse(req.body);

    // Check if email already exists
    const checkUserQuery = 'SELECT id FROM signup_table WHERE email = $1';
    const userExists = await conn.query(checkUserQuery, [email]);

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const insertUserQuery = `
      INSERT INTO signup_table (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email
    `;
    const result = await conn.query(insertUserQuery, [name, email, hashedPassword]);

    return res.status(201).json({
      message: 'Account created successfully',
      user: result.rows[0],
    });

  } catch (err) {
    if (err.name === 'ZodError') {
      // Handle schema validation errors
      return res.status(400).json({ message: err.errors[0].message });
    }

    console.error('Error in /createAccount:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
})
// 3. login endpoint
app.post('/login',async (req,res)=>{
    try{
        const {email,password} = req.body 

        if(!email) return res.status(401).json({message:"email is required"});
        if(!password) return res.status(401).json({message:"password is required"});
        const checkEmailQuery = 'SELECT * FROM signup_table WHERE email = $1'
        const {rows} = await conn.query(checkEmailQuery,[email])
        
        if(rows===0){
            return res.status(404).json({message:"user not found"})
        }
        const user = rows[0]
        // compare password 
        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(401).json({message:'invalid email or password'})
        }

        const token = webToken.sign(
            {id:user.id,email:user.email},
            process.env.SECRET_KEY,
        {expiresIn:'1h'})

        return res.status(200).json({
            message:"login successful",
            token,
            id:user.id,
            name:user.name,
            email:user.email
        })
    }catch(err){
        console.error('login error',err)
        return res.status(500).json({messsage:'Internal Server Error'})
    }
});

const tokenBlacklist = new Set();

// logout api 
app.post('/logout', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  tokenBlacklist.add(token); // optionally store with an expiry (e.g., using Redis TTL)
  return res.status(200).json({ message: 'Token invalidated. User logged out.' });
});
// add new notes
app.post('/add-note',authenticateToken,async (req,res)=>{
    const {title,content,is_pinned} = req.body;
    const currUser = req.user;

    if(!title) return res.status(401).json({message:'Title is required'});
    if(!content) return res.status(401).json({message:'Content is required'});
    // adding new note
 const addNoteQuery = `
    INSERT INTO notes (title, content, is_pinned, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, content, is_pinned
  `;

    try{
        const result = await  conn.query(addNoteQuery,[title,content,is_pinned,currUser.id]);
        const note = result.rows[0]
        return res.status(201).json({
            message:"Note added successfully",
            note:{
                id:note.id ,
                title:note.title,
                content:note.content,
                is_pinned:note.is_pinned
            }
        })
    }
    catch(err){
        console.log('Server error',err.message)
        return res.status(500).json({message:"Unable to reach server"})
    }
})
// update the notes 

app.get('/allNotes', authenticateToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID missing.' });
  }

  try {
    const query = 'SELECT * FROM notes WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3';
    const result = await conn.query(query, [userId, limit, offset]);

    res.status(200).json({
      message: 'Notes fetched with pagination',
      data: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Error fetching notes with pagination:', error.message);
    res.status(500).json({ message: 'Server error fetching notes' });
  }
});


// fetch all nots ---byuserid 
app.get('/allNotesByUserID',authenticateToken,async (req,res)=>{
  const userId = req.user.id;
  try {
    const result = await conn.query('SELECT * FROM notes WHERE user_id = $1', [userId]);
    res.status(200).json({ message: "Your notes", notes: result.rows });
  } catch (err) {
    console.error("Error while getting notes", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
})

app.delete('/delete/:noteId',authenticateToken,async (req,res)=>{
  const noteId = req.params.noteId 
  
  const deleteQuery = 'DELETE FROM notes WHERE id = $1 RETURNING *';
  //running query 
  try{
  const result = await conn.query(deleteQuery,[noteId]);
  if(result.rowCount === 0){
    return res.status(404).json({message:'Note not found'})
  }
  res.status(200).json({
    message:"Deleted record!",
  })

  }catch(err){
    console.error("Failed to deleted! ",err.message);
    res.status(500).json({message:"Internal server error"});
  }
})

// get all the users 
app.get('/getUsers', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  const seeUserQuery = 'SELECT name, email FROM signup_table WHERE id = $1';

  try {
    const isUser = await conn.query(seeUserQuery, [userId]);

    if (isUser.rows.length === 0) {
      return res.status(404).json({ message: "No user found!" });
    }

    return res.status(200).json({
      user: isUser.rows[0],
      message: "User fetched successfully",
    });

  } catch (err) {
    console.error("Error fetching user:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//search api 
app.get('/searchNotes', authenticateToken, async (req, res) => {
  const userId = req.user.id; // <-- use this if token payload is { id, name, email }
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      error: true,
      message: "Search query is required",
    });
  }

  try {
    const searchQuery = `
      SELECT id, title, content, is_pinned 
      FROM notes 
      WHERE user_id = $1 AND (title ILIKE $2 OR content ILIKE $2)
    `;
    const result = await conn.query(searchQuery, [userId, `%${query}%`]);

    return res.status(200).json({
      message: "Search results fetched!",
      count: result.rows.length,
      notes: result.rows,
    });
  } catch (err) {
    console.error("Error searching notes:", err.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
});



app.listen(3000,()=>{
    console.log(`server is running at http://localhost:3000`)
})
