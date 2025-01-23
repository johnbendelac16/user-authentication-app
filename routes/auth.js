const express = require('express');
const User = require('../models/User'); 

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
  
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send({ message: 'Use already exists' });
      }
  
      // Créer un nouvel utilisateur
      const userRole = role || 'user';
      const user = new User({ name, email, password, role: userRole });
      await user.save();
  
      // Générer un token d'authentification
      const token = user.generateAuthToken();
  
      res.status(201).send({ message: 'User created', token });
    } catch (err) {
      res.status(500).send({ message: 'Erreur serveur', error: err.message });
    }
  });


  // Route pour la connexion de l'utilisateur
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Trouver l'utilisateur par email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send({ message: 'Utilisateur non trouvé' });
      }
  
      // Vérifier si le mot de passe est correct
      const isMatch = await user.isValidPassword(password);
      if (!isMatch) {
        return res.status(400).send({ message: 'Mot de passe incorrect' });
      }
  
      // Générer un token d'authentification
      const token = user.generateAuthToken();
  
      res.status(200).send({ message: 'Connexion réussie', token });
    } catch (err) {
      res.status(500).send({ message: 'Erreur serveur', error: err.message });
    }
  });

  module.exports = router;
