const express = require('express');
const path = require('path');
const session = require('express-session');
const { initDatabase } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'aptitude-revision-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: false
    }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/progress', require('./routes/progress'));

// SPA fallback
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Route non trouvée' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function start() {
    await initDatabase();
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════╗
║   🎯 Site de Révision - Test d'Aptitude Suisse  ║
║                                                  ║
║   ➡️  http://localhost:${PORT}                    ║
║                                                  ║
║   👤 Admin: admin / admin123                     ║
╚══════════════════════════════════════════════════╝
        `);
    });
}

start().catch(console.error);
