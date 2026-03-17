const express = require('express');
const { dbQuery } = require('../database/db');

const router = express.Router();

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non connecté' });
    }
    next();
}

router.use(requireAuth);

// Get overall summary
router.get('/summary', async (req, res) => {
    const userId = req.session.userId;
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const totalResult = await dbQuery(
            "SELECT COALESCE(SUM(total_questions), 0) as total, COALESCE(SUM(correct_answers), 0) as correct, COALESCE(SUM(time_spent_seconds), 0) as time FROM sessions_log WHERE user_id = ?",
            [userId]
        );
        const t = totalResult[0] || { total: 0, correct: 0, time: 0 };
        
        const streakResult = await dbQuery("SELECT current_streak, longest_streak FROM daily_streaks WHERE user_id = ?", [userId]);
        const streak = streakResult[0] || { current_streak: 0, longest_streak: 0 };
        
        const daysResult = await dbQuery("SELECT COUNT(DISTINCT date) as days FROM sessions_log WHERE user_id = ?", [userId]);
        const daysActive = daysResult[0] ? daysResult[0].days : 0;
        
        const todayResult = await dbQuery(
            "SELECT COALESCE(SUM(total_questions), 0) as total, COALESCE(SUM(correct_answers), 0) as correct, COALESCE(SUM(time_spent_seconds), 0) as time FROM sessions_log WHERE user_id = ? AND date = ?",
            [userId, today]
        );
        const td = todayResult[0] || { total: 0, correct: 0, time: 0 };
        
        res.json({
            total_questions: Number(t.total),
            correct_answers: Number(t.correct),
            success_rate: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
            total_time_seconds: Number(t.time),
            current_streak: Number(streak.current_streak),
            longest_streak: Number(streak.longest_streak),
            days_active: Number(daysActive),
            today: {
                total_questions: Number(td.total),
                correct_answers: Number(td.correct),
                success_rate: td.total > 0 ? Math.round((td.correct / td.total) * 100) : 0,
                time_seconds: Number(td.time)
            }
        });
    } catch (err) {
        console.error('Summary error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get daily history
router.get('/daily', async (req, res) => {
    try {
        const rows = await dbQuery(
            "SELECT date, SUM(total_questions) as total, SUM(correct_answers) as correct, SUM(time_spent_seconds) as time FROM sessions_log WHERE user_id = ? GROUP BY date ORDER BY date DESC LIMIT 30",
            [req.session.userId]
        );
        
        res.json(rows.map(r => ({
            date: r.date,
            total_questions: Number(r.total),
            correct_answers: Number(r.correct),
            success_rate: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0,
            time_seconds: Number(r.time)
        })));
    } catch (err) {
        console.error('Daily error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get category stats
router.get('/categories', async (req, res) => {
    try {
        const rows = await dbQuery(
            "SELECT category, SUM(total_questions) as total, SUM(correct_answers) as correct, SUM(time_spent_seconds) as time FROM sessions_log WHERE user_id = ? GROUP BY category",
            [req.session.userId]
        );
        
        const labels = { operations: 'Opérations', fractions: 'Fractions', unites: 'Unités', pourcentages: 'Pourcentages', geometrie: 'Géométrie', francais: 'Français' };
        
        res.json(rows.map(r => ({
            category: r.category,
            label: labels[r.category] || r.category,
            total_questions: Number(r.total),
            correct_answers: Number(r.correct),
            success_rate: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0,
            time_seconds: Number(r.time)
        })));
    } catch (err) {
        console.error('Categories error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
