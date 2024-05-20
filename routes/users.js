var express = require("express");
var router = express.Router();
require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

// POST '/user/signup' => se créer un compte
router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["username", "email", "password"])) {
    res.json({ result: false, error: "Missing fields" });
    return;
  }

  const { username, email, password } = req.body;

  // Vérifiez si le nom d'utilisateur ou l'email existent déjà dans la base de données
  User.findOne({ $or: [{ email: email }, { username: username }] })
    .then((data) => {
      if (data) {
        // Si un utilisateur avec cet email ou ce nom d'utilisateur existe déjà, renvoyez une erreur
        res.json({ result: false, error: "Username or email already exists" });
      } else {
        // Sinon, créez un nouveau compte utilisateur
        const hash = bcrypt.hashSync(password, 10);

        const newUser = new User({
          email: email,
          username: username,
          password: hash,
          token: uid2(32),
        });

        newUser.save().then((newDoc) => {
          res.json({
            result: true,
            email: newDoc.email,
            username: newDoc.username,
            token: newDoc.token,
            id: newDoc._id,
          });
        });
      }
    })
    .catch((error) => {
      // Gérer les erreurs de la base de données, par exemple une erreur de connexion à la base de données
      res.status(500).json({ result: false, error: "Database error" });
    });
});

// POST '/user/signin' => se connecter
router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing fields" });
    return;
  }

  User.findOne({ email: req.body.email }).then((data) => {
    if (bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: data.token,
        email: data.email,
      });
    } else {
      res.json({ result: false, error: "User not found" });
    }
  });
});

// GET '/user/logout' => se déconnecter
router.get("/logout", (req, res) => {
  // Récupère le token d'authentification depuis le corps de la requête
  const token = req.body.token;

  if (!token) {
    res.status(400).json({ result: false, error: "Token not provided" });
    return;
  }
  res.json({ result: true, message: "User logged out successfully" });
});

// GET 'users/:token" => recuperer par token
router.get("/:token", (req, res) => {
  console.log(req.body.token);
  User.findOne({ token: req.body.token }).then((data) => {
    if (data) {
      res.json({ result: true, user: data });
    } else {
      res.json({ result: false, error: "User not found" });
    }
  });
});

// DELETE '/user/:username' => Supprimer mon compte
router.delete("/", (req, res) => {
  const username = req.body.username;

  if (!username) {
    res.status(400).json({
      result: false,
      error: "Username not provided in the request body",
    });
    return;
  }
  User.deleteOne({ username })
    .then((deletedDoc) => {
      if (deletedDoc.deletedCount > 0) {
        res.json({ result: true });
      } else {
        res.status(404).json({ result: false, error: "User not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ result: false, error: error.message });
    });
});

module.exports = router;
