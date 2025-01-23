const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("❌ JWT_SECRET is not defined in .env file");
}

module.exports = function (req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return res.status(401).send({ message: 'Accès refusé. Aucun token fourni.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log(req.user.role);
        
        if (req.user.role && req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).send({ message: 'Accès interdit. Rôle insuffisant.' });
        }
    } catch (err) {
        res.status(400).send({ message: 'Invalid Token.' });
    }
};
