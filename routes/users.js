var express = require("express");
var router = express.Router();
require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const { authenticateToken, createToken } = require('../modules/authentication')


function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|fr)$/;
  return emailRegex.test(email);
}

// POST '/user/signup' => se créer un compte
router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["username", "email", "password"])) {
    res.json({ result: false, error: "Tous les champs ne sont pas remplis" });
    return;
  }

  const { username, email, password } = req.body;
  // Validation de l'email
  if (!validateEmail(email)) {
    res.json({ result: false, error: "Format d'adresse e-mail invalide" });
    return;
  }

  // Vérifiez si le nom d'utilisateur ou l'email existent déjà dans la base de données
  User.findOne({ $or: [{ email: email }, { username: username }] })
    .then((data) => {
      if (data) {
        // Si un utilisateur avec cet email ou ce nom d'utilisateur existe déjà, renvoyez une erreur
        res.json({ result: false, error: "Adresse e-mail ou nom d'utilisateur déjà utilisé" });
      } else {
        // Sinon, créez un nouveau compte utilisateur
        const hash = bcrypt.hashSync(password, 10);

        const newUser = new User({
          email: email,
          username: username,
          password: hash
        });

        newUser.save().then((newDoc) => {
          res.json({
            result: true,
            email: newDoc.email,
            username: newDoc.username,
            id: newDoc._id,
            token: createToken(newDoc._id)
          });
        });
      }
    })
    .catch((error) => {
      // Gérer les erreurs de la base de données, par exemple une erreur de connexion à la base de données
      res.status(500).json({ result: false, error: "Erreur de base de donnée" });
    });
});


// POST '/user/signin' => se connecter
router.post("/signin", (req, res) => {
  console.log(uid2(32))
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing fields" });
    return;
  }

  User.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: createToken(data.username),
        email: data.email,
        username: data.username
      });
    } else {
      res.json({ result: false, error: "E-mail ou mot de passe incorrect(s)" });
    }
  });
});

module.exports = router;
