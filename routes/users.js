var express = require("express");
var router = express.Router();
require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const { createToken } = require('../modules/authentication')
const { authenticate } = require('../modules/authentication')
const dcm = require('../models/dcm')

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
  if (!validateEmail(email)) {
    res.json({ result: false, error: "Format d'adresse e-mail invalide" });
    return;
  }
  User.findOne({ $or: [{ email: email }, { username: username }] })
    .then((data) => {
      if (data) {
        res.json({ result: false, error: "Adresse e-mail ou nom d'utilisateur déjà utilisé" });
      } else {
        const hash = bcrypt.hashSync(password, 10);
        const newUser = new User({
          email: email,
          username: username,
          password: hash,
          isAdmin: false
        });

        newUser.save().then((newDoc) => {
          res.json({
            result: true,
            email: newDoc.email,
            username: newDoc.username,
            id: newDoc._id,
            token: createToken({userId: newDoc._id, isAdmin: newDoc.isAdmin})
          });
        });
      }
    })
    .catch((error) => {
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
        token: createToken({userId: data._id, isAdmin: data.isAdmin}),
        email: data.email,
        id: data._id,
        username: data.username
      });
    } else {
      res.json({ result: false, error: "E-mail ou mot de passe incorrect(s)" });
    }
  });
});

module.exports = router;
