const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // Pour sécuriser les mots de passe
const jwt = require('jsonwebtoken'); // Pour générer des tokens
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Assure-toi que le rôle peut être soit 'user', soit 'admin'
    default: 'user', // Si le rôle n'est pas spécifié, le rôle par défaut est 'user'
  },
   profileImage: { type: String },

  resetToken: String,
  resetTokenExpiration: Date,
});

// Hacher le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Vérifier si le mot de passe est correct
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Générer un token JWT
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { 
          _id: this._id,
          role: this.role  // Inclure le rôle de l'utilisateur
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );
      return token;
    };

    // Générer un token de réinitialisation de mot de passe
userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetTokenExpiration = Date.now() + 15 * 60 * 1000; // 15 minutes
    return resetToken;
  };

const User = mongoose.model('User', userSchema);
module.exports = User;
