const express = require('express');
const authMiddleware = require('../middleware/authMiddleware'); // Le middleware d'authentification
const User = require('../models/User'); // Si tu veux renvoyer les infos utilisateur

const router = express.Router();

// Route protégée : récupérer les informations de l'utilisateur connecté
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // Utiliser `req.user` pour trouver l'utilisateur connecté
        if (!user) {
            return res.status(404).send({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).send({ user });
    } catch (err) {
        res.status(500).send({ message: 'Erreur serveur', error: err.message });
    }
});


router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const updates = Object.keys(req.body); // Récupère les clés des champs à mettre à jour
        const allowedUpdates = ['name', 'email']; // Champs autorisés à être modifiés
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).send({ message: 'Invalid updates' });
        }

        const user = await User.findById(req.user._id); // Trouver l'utilisateur connecté
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        updates.forEach((update) => user[update] = req.body[update]); // Mettre à jour les champs

        await user.save();
        res.status(200).send({ message: 'Profile updated', user });
    } catch (err) {
        res.status(500).send({ message: 'Error updating profile', error: err.message });
    }
});



router.patch('/change-password', authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const isMatch = await user.isValidPassword(oldPassword); // Vérifier si le mot de passe actuel est correct
        if (!isMatch) {
            return res.status(400).send({ message: 'Old password is incorrect' });
        }

        user.password = newPassword; // Mettre à jour le mot de passe
        await user.save();

        res.status(200).send({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).send({ message: 'Error changing password', error: err.message });
    }
});


router.get('/users', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || user.role !== 'admin') { // Vérification que l'utilisateur est un administrateur
            return res.status(403).send({ message: 'Access denied' });
        }

        const users = await User.find(); // Récupérer tous les utilisateurs
        res.status(200).send({ users });
    } catch (err) {
        res.status(500).send({ message: 'Error fetching users', error: err.message });
    }
});

// Route pour modifier un utilisateur
router.put('/users/:id', authMiddleware, async (req, res) => {
    try {
      // Vérifier si l'utilisateur a le rôle admin
      if (req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Accès interdit. Rôle insuffisant.' });
      }
  
      const { id } = req.params;
      const { name, email, role } = req.body;
  
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { name, email, role },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).send({ message: 'Utilisateur non trouvé' });
      }
  
      res.status(200).send(updatedUser);
    } catch (err) {
      res.status(500).send({ message: 'Erreur serveur', error: err.message });
    }
  });
  

  // Route pour supprimer un utilisateur
router.delete('/users/:id', authMiddleware, async (req, res) => {
    try {
      // Vérifier si l'utilisateur a le rôle admin
      if (req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Accès interdit. Rôle insuffisant.' });
      }
  
      const { id } = req.params;
  
      const deletedUser = await User.findByIdAndDelete(id);
  
      if (!deletedUser) {
        return res.status(404).send({ message: 'Utilisateur non trouvé' });
      }
  
      res.status(200).send({ message: 'Utilisateur supprimé' });
    } catch (err) {
      res.status(500).send({ message: 'Erreur serveur', error: err.message });
    }
  });
  

module.exports = router;
