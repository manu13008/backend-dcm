const jwt = require("jsonwebtoken");
// Importez votre secret JWT depuis votre configuration
const { JWT_SECRET } = require("../env");

const authMiddleware = (req, res, next) => {
  // Récupérez le token d'authentification de l'en-tête Authorization
  const token = req.headers.authorization;

  // Vérifiez si le token est présent
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Vérifiez si le token est valide
    const decoded = jwt.verify(token, JWT_SECRET);

    // Stockez les informations utilisateur décodées dans l'objet de demande pour une utilisation ultérieure
    req.user = decoded;

    // Passez à la prochaine étape du middleware
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
