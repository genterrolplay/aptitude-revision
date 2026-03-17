const express = require('express');
const bcrypt = require('bcryptjs');
const { dbQuery, dbRun, saveDatabase } = require('../database/db');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }
    
    try {
        const users = await dbQuery("SELECT * FROM users WHERE username = ?", [username]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }
        
        const user = users[0];
        
        if (!bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }
        
        req.session.userId = user.id;
        req.session.isAdmin = user.is_admin === 1 || user.is_admin === true;
        
        res.json({
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            is_admin: user.is_admin === 1 || user.is_admin === true
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get current user
router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non connecté' });
    }
    
    try {
        const users = await dbQuery("SELECT id, username, display_name, is_admin FROM users WHERE id = ?", [req.session.userId]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Utilisateur introuvable' });
        }
        
        const user = users[0];
        user.is_admin = user.is_admin === 1 || user.is_admin === true;
        res.json(user);
    } catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
