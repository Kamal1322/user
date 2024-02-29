const jwt = require("jsonwebtoken");
const secretkey = 'mysecretkey' ;

const authenticateToken = (req,res,next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({error:'Unauthorized'});

    jwt.verify(token.replace('Bearer',''),secretkey, (err, decoded) =>{
        // console.log('Token content:', us);
        if (err) return res.status(403).send('Invalid Token');
         req.user = decoded.user;
         req.user.id = decoded.user.userId;
        next();
    });
};
module.exports = authenticateToken;