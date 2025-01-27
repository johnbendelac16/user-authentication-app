require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const router = require('./routes/protectedRoutes');


const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/protectedRoutes', router); 

// Route de test
app.get('/', (req, res) => {
    res.send('Serveur working 🚀');
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur stated on http://localhost:${PORT}`);
});
