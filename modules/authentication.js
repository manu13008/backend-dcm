const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
   
    if (!token) { res.sendStatus(401).json('unauthorized') }
   
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.userId = user.userId;
    });

    next()
}

function createToken(userId) {
    const token = jwt.sign({userId: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token
}

module.exports = { authenticateToken, createToken }

