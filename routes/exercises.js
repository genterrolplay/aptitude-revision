const express = require('express');
const { dbQuery, dbRun, saveDatabase } = require('../database/db');

const router = express.Router();

const generators = {
    operations: require('../generators/math-operations'),
    fractions: require('../generators/math-fractions'),
    unites: require('../generators/math-units'),
    pourcentages: require('../generators/math-percentages'),
    geometrie: require('../generators/math-geometry'),
    francais: require('../generators/french'),
};

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non connecté' });
    }
    next();
}

router.use(requireAuth);

// Get available categories
router.get('/categories', (req, res) => {
    res.json([
        { id: 'operations', label: 'Opérations simples', icon: '➕', description: 'Addition, soustraction, multiplication, division' },
        { id: 'fractions', label: 'Fractions et décimaux', icon: '🔢', description: 'Conversion décimal/fraction, simplification' },
        { id: 'unites', label: 'Changement d\'unités', icon: '📏', description: 'cm, m, km, kg, L, etc.' },
        { id: 'pourcentages', label: 'Pourcentages', icon: '💯', description: 'Calculs de pourcentages, augmentations, réductions' },
        { id: 'geometrie', label: 'Géométrie', icon: '📐', description: 'Aire, périmètre, volume, Pythagore' },
        { id: 'francais', label: 'Français', icon: '📝', description: 'Orthographe, conjugaison, compréhension' },
    ]);
});

// Generate a question
router.get('/question/:category', (req, res) => {
    const { category } = req.params;
    const difficulty = parseInt(req.query.difficulty) || 3;
    if (!generators[category]) {
        return res.status(400).json({ error: 'Catégorie inconnue' });
    }
    res.json(generators[category].generate(difficulty));
});

// Generate mixed question
router.get('/question', (req, res) => {
    const difficulty = parseInt(req.query.difficulty) || 3;
    const categories = Object.keys(generators);
    const cat = categories[Math.floor(Math.random() * categories.length)];
    res.json(generators[cat].generate(difficulty));
});

// Submit answer
router.post('/submit', async (req, res) => {
    const { category, question_text, user_answer, correct_answer, is_correct, time_spent } = req.body;
    const userId = req.session.userId;
    const today = new Date().toISOString().split('T')[0];
    
    try {
        // Log question
        await dbRun(
            "INSERT INTO question_log (user_id, category, question_text, user_answer, correct_answer, is_correct, time_spent_seconds) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userId, category, question_text, user_answer, correct_answer, is_correct ? 1 : 0, time_spent || 0]
        );
        
        // Update session log
        const existing = await dbQuery(
            "SELECT id, total_questions, correct_answers, time_spent_seconds FROM sessions_log WHERE user_id = ? AND date = ? AND category = ?",
            [userId, today, category]
        );
        
        if (existing.length > 0) {
            const s = existing[0];
            await dbRun(
                "UPDATE sessions_log SET total_questions = ?, correct_answers = ?, time_spent_seconds = ? WHERE id = ?",
                [s.total_questions + 1, s.correct_answers + (is_correct ? 1 : 0), s.time_spent_seconds + (time_spent || 0), s.id]
            );
        } else {
            await dbRun(
                "INSERT INTO sessions_log (user_id, date, category, total_questions, correct_answers, time_spent_seconds) VALUES (?, ?, ?, ?, ?, ?)",
                [userId, today, category, 1, is_correct ? 1 : 0, time_spent || 0]
            );
        }
        
        // Update streak
        const streaks = await dbQuery("SELECT * FROM daily_streaks WHERE user_id = ?", [userId]);
        
        if (streaks.length === 0) {
            await dbRun("INSERT INTO daily_streaks (user_id, current_streak, longest_streak, last_active_date) VALUES (?, 1, 1, ?)",
                [userId, today]);
        } else {
            const streak = streaks[0];
            if (streak.last_active_date !== today) {
                const lastDate = new Date(streak.last_active_date);
                const todayDate = new Date(today);
                const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
                const newStreak = diffDays === 1 ? streak.current_streak + 1 : 1;
                const longestStreak = Math.max(newStreak, streak.longest_streak);
                await dbRun("UPDATE daily_streaks SET current_streak = ?, longest_streak = ?, last_active_date = ? WHERE user_id = ?",
                    [newStreak, longestStreak, today, userId]);
            }
        }
        
        await saveDatabase();
        res.json({ success: true });
    } catch (err) {
        console.error('Submit error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
