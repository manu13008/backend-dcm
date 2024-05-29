const jwt = require('jsonwebtoken');

function authenticate(type = 'regular') {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if(type !== 'allowAnonym' && !token) {res.sendStatus(401).json('Unauthorized')}

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      console.log(user)
      if (err || (!user.isAdmin && type === 'mustBeAdmin')) { return res.sendStatus(403).json({result: false, error: "Forbidden. Vous n'avez pas les droits requis"})}
      req.userId = user.userId;
      next()
    });
  }
}

function createToken(params) {
    const token = jwt.sign({userId: params.userId, isAdmin: params.isAdmin }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token
}

module.exports = { authenticate, createToken }

