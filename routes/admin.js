const express = require('express');
const bcrypt = require('bcryptjs');
const { dbQuery, dbRun, saveDatabase } = require('../database/db');

const router = express.Router();

function requireAdmin(req, res, next) {
    if (!req.session.userId || !req.session.isAdmin) {
        return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
}

router.use(requireAdmin);

// List all users
router.get('/users', async (req, res) => {
    try {
        const users = await dbQuery("SELECT id, username, display_name, is_admin, created_at FROM users ORDER BY created_at DESC");
        users.forEach(u => u.is_admin = u.is_admin === 1 || u.is_admin === true);
        res.json(users);
    } catch (err) {
        console.error('List users error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Create user
router.post('/users', async (req, res) => {
    const { username, password, display_name, is_admin } = req.body;
    
    if (!username || !password || !display_name) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    if (username.length < 3) {
        return res.status(400).json({ error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' });
    }
    if (password.length < 4) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 4 caractères' });
    }
    
    try {
        const existing = await dbQuery("SELECT id FROM users WHERE username = ?", [username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Ce nom d\'utilisateur existe déjà' });
        }
        
        const hash = bcrypt.hashSync(password, 10);
        await dbRun("INSERT INTO users (username, password_hash, display_name, is_admin) VALUES (?, ?, ?, ?)",
            [username, hash, display_name, is_admin ? 1 : 0]);
        await saveDatabase();
        
        const newUsers = await dbQuery("SELECT id, username, display_name, is_admin, created_at FROM users WHERE username = ?", [username]);
        const user = newUsers[0];
        user.is_admin = user.is_admin === 1 || user.is_admin === true;
        res.json(user);
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    if (userId === req.session.userId) {
        return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    
    try {
        await dbRun("DELETE FROM question_log WHERE user_id = ?", [userId]);
        await dbRun("DELETE FROM sessions_log WHERE user_id = ?", [userId]);
        await dbRun("DELETE FROM daily_streaks WHERE user_id = ?", [userId]);
        await dbRun("DELETE FROM users WHERE id = ?", [userId]);
        await saveDatabase();
        res.json({ success: true });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Reset password
router.put('/users/:id/reset-password', async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 4) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 4 caractères' });
    }
    
    try {
        const hash = bcrypt.hashSync(password, 10);
        await dbRun("UPDATE users SET password_hash = ? WHERE id = ?", [hash, parseInt(req.params.id)]);
        await saveDatabase();
        res.json({ success: true });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get user stats
router.get('/users/:id/stats', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const sessions = await dbQuery(
            "SELECT date, category, total_questions, correct_answers, time_spent_seconds FROM sessions_log WHERE user_id = ? ORDER BY date DESC LIMIT 30",
            [userId]
        );
        const streak = await dbQuery("SELECT * FROM daily_streaks WHERE user_id = ?", [userId]);
        
        res.json({
            sessions,
            streak: streak.length > 0 ? streak[0] : { current_streak: 0, longest_streak: 0 }
        });
    } catch (err) {
        console.error('User stats error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
