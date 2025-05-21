import webtoken from 'jsonwebtoken'

const authenticateToken = (req,res,next) =>{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.sendStatus(401);
    webtoken.verify(token, process.env.SECRET_KEY,(err,user)=>{
        if(err) return res.sendStatus(401);
        req.user = user;
        next();
    })
}

export default authenticateToken;
