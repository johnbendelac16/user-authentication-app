const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware'); // Import du middleware
const authMiddleware = require('../middleware/authMiddleware'); // Si tu utilises un middleware pour vérifier l'authentification
const User = require('../models/User');

// Route pour télécharger une image de profil
router.post('/upload-profile-image', authMiddleware, upload.single('profileImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'Aucun fichier téléchargé.' });
  }

  try {
    const user = await User.findById(req.user.id); // Récupérer l'utilisateur à partir de l'ID dans le token
    user.profileImage = req.file.path; // Sauvegarder le chemin du fichier image
    await user.save(); // Sauvegarder l'utilisateur avec l'image mise à jour

    res.status(200).send({ message: 'Image de profil mise à jour avec succès.', filePath: req.file.path });
  } catch (err) {
    res.status(500).send({ message: 'Erreur serveur.', error: err });
  }
});

module.exports = router;
