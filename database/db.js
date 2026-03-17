const bcrypt = require('bcryptjs');

let db = null;
let dbType = null; // 'sqlite' or 'postgres'
let pgPool = null;

async function initDatabase() {
    if (process.env.DATABASE_URL) {
        // PostgreSQL mode (cloud deployment)
        dbType = 'postgres';
        const { Pool } = require('pg');
        pgPool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
        });
        db = pgPool;
        
        // Create tables
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                display_name TEXT NOT NULL,
                is_admin INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS sessions_log (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                date TEXT NOT NULL,
                category TEXT NOT NULL,
                total_questions INTEGER DEFAULT 0,
                correct_answers INTEGER DEFAULT 0,
                time_spent_seconds INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS daily_streaks (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                last_active_date TEXT
            )
        `);
        
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS question_log (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                session_id INTEGER,
                category TEXT NOT NULL,
                question_text TEXT,
                user_answer TEXT,
                correct_answer TEXT,
                is_correct INTEGER,
                time_spent_seconds INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Create default admin
        const adminCheck = await pgPool.query("SELECT id FROM users WHERE username = 'admin'");
        if (adminCheck.rows.length === 0) {
            const hash = bcrypt.hashSync('admin123', 10);
            await pgPool.query("INSERT INTO users (username, password_hash, display_name, is_admin) VALUES ($1, $2, $3, $4)",
                ['admin', hash, 'Administrateur', 1]);
            console.log('✅ Compte admin créé (admin / admin123)');
        }
        
        console.log('✅ Base de données PostgreSQL connectée');
    } else {
        // SQLite mode (local)
        dbType = 'sqlite';
        const initSqlJs = require('sql.js');
        const path = require('path');
        const fs = require('fs');
        
        const DB_PATH = path.join(__dirname, '..', 'data', 'aptitude.db');
        const SQL = await initSqlJs();
        
        const dataDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        if (fs.existsSync(DB_PATH)) {
            const buffer = fs.readFileSync(DB_PATH);
            db = new SQL.Database(buffer);
        } else {
            db = new SQL.Database();
        }
        
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL, display_name TEXT NOT NULL,
            is_admin INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS sessions_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
            date TEXT NOT NULL, category TEXT NOT NULL,
            total_questions INTEGER DEFAULT 0, correct_answers INTEGER DEFAULT 0,
            time_spent_seconds INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS daily_streaks (
            user_id INTEGER PRIMARY KEY, current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0, last_active_date TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS question_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
            session_id INTEGER, category TEXT NOT NULL,
            question_text TEXT, user_answer TEXT, correct_answer TEXT,
            is_correct INTEGER, time_spent_seconds INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);
        
        const adminExists = db.exec("SELECT id FROM users WHERE username = 'admin'");
        if (adminExists.length === 0) {
            const hash = bcrypt.hashSync('admin123', 10);
            db.run("INSERT INTO users (username, password_hash, display_name, is_admin) VALUES (?, ?, ?, ?)",
                ['admin', hash, 'Administrateur', 1]);
            console.log('✅ Compte admin créé (admin / admin123)');
        }
        
        // Auto-save
        const saveFn = () => {
            if (db) {
                const data = db.export();
                fs.writeFileSync(DB_PATH, Buffer.from(data));
            }
        };
        setInterval(saveFn, 30000);
        saveFn();
        
        console.log('✅ Base de données SQLite initialisée');
    }
    
    return db;
}

// ========== Unified DB interface ==========

// Execute a query and return results
async function dbQuery(sql, params = []) {
    if (dbType === 'postgres') {
        // Convert ? to $1, $2... for pg
        let paramIndex = 0;
        const pgSql = sql.replace(/\?/g, () => `$${++paramIndex}`);
        const result = await pgPool.query(pgSql, params);
        return result.rows;
    } else {
        const result = db.exec(sql, params);
        if (result.length === 0) return [];
        return result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        });
    }
}

// Execute a query without returning results
async function dbRun(sql, params = []) {
    if (dbType === 'postgres') {
        let paramIndex = 0;
        const pgSql = sql.replace(/\?/g, () => `$${++paramIndex}`);
        await pgPool.query(pgSql, params);
    } else {
        db.run(sql, params);
    }
}

// Save database (only needed for SQLite)
async function saveDatabase() {
    if (dbType === 'sqlite' && db) {
        const path = require('path');
        const fs = require('fs');
        const DB_PATH = path.join(__dirname, '..', 'data', 'aptitude.db');
        const data = db.export();
        fs.writeFileSync(DB_PATH, Buffer.from(data));
    }
}

function getDbType() { return dbType; }

module.exports = { initDatabase, dbQuery, dbRun, saveDatabase, getDbType };
