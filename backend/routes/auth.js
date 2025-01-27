const express = require('express');
const User = require('../models/User'); 
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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


  // Route pour demander un lien de réinitialisation de mot de passe
router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email." });
      }
  
      // Générer un token sécurisé
      const resetToken = user.generatePasswordResetToken();
      await user.save();
  
      // URL de réinitialisation
      const resetUrl = `http://localhost:5001/api/protectedRoutes/reset-password/${resetToken}`;
  
      // Configurer le transporteur email (utilisation de Mailtrap pour les tests)
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === "true", // true pour le port 465, false pour 587
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Envoyer l'email
      await transporter.sendMail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        html: `<p>Vous avez demandé une réinitialisation de mot de passe.</p>
               <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
               <a href="${resetUrl}">${resetUrl}</a>
               <p>Ce lien est valable 15 minutes.</p>`,
      });
  
      res.json({ message: "Email de réinitialisation envoyé." });
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  });
  
  module.exports = router;
