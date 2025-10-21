import { createClient } from '@libsql/client';

const db = createClient({
  url: 'file:bapi.db'
});

async function initDatabase() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bapi_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'first_line_support',
        disabled BOOLEAN DEFAULT FALSE,
        settings TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_code TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES bapi_users(id) ON DELETE CASCADE
      )
    `);

    await db.execute('CREATE INDEX IF NOT EXISTS idx_sessions_code ON sessions(session_code)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)');

    await seedDatabase();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// DEBUG
async function seedDatabase() {
  const result = await db.execute('SELECT COUNT(*) as count FROM bapi_users');
  const userCount = result.rows[0].count;

  if (userCount === 0) {
    console.log('Seeding database with test users...');

    const users = [
      {
        key: 'admin_key',
        role: 'admin',
        settings: null
      },
      {
        key: 'support_key',
        role: 'support_engineer',
        settings: JSON.stringify({
          limitations: { brand_slugs: ['integrilla'], user_ids: [123, 456] }
        })
      },
      {
        key: 'firstline_key',
        role: 'first_line_support',
        settings: JSON.stringify({
          limitations: { brand_slugs: ['chatserv'], user_ids: [789] }
        })
      }
    ];

    for (const user of users) {
      await db.execute({
        sql: 'INSERT INTO bapi_users (key, role, settings) VALUES (?, ?, ?)',
        args: [user.key, user.role, user.settings]
      });
    }
    console.log('Test users added');
  }
}

async function cleanupExpiredSessions() {
  await db.execute("DELETE FROM sessions WHERE expires_at <= datetime('now')");
}

initDatabase();
cleanupExpiredSessions();

export const DB = {
  async getUserByKey(userKey) {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM bapi_users WHERE key = ? AND disabled = FALSE',
        args: [userKey]
      });
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by key:', error);
      return null;
    }
  },


  async createSession(userId, sessionCode) {
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await db.execute({
        sql: 'INSERT INTO sessions (user_id, session_code, expires_at) VALUES (?, ?, ?)',
        args: [userId, sessionCode, expiresAt.toISOString()]
      });
      return sessionCode;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  async getSessionWithUser(sessionCode) {
    try {
      const result = await db.execute({
        sql: `
          SELECT s.*, u.key as user_key, u.role, u.settings, u.disabled
          FROM sessions s
          JOIN bapi_users u ON s.user_id = u.id
          WHERE s.session_code = ? AND s.expires_at > datetime('now') AND u.disabled = FALSE
        `,
        args: [sessionCode]
      });

      const session = result.rows[0];
      if (session) {

        let settings = {};

        if (session.settings) {
          try {
            settings = JSON.parse(session.settings);
          } catch (e) {
            console.error('Error parsing settings:', e);
          }
        }

        session.settings = {
          role: session.role, // adding role from session
          limitations: settings.limitations || {
            brand_slugs: [],
            user_ids: []
          }
        };
      }

      return session || null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  async deleteSession(sessionCode) {
    try {
      await db.execute({
        sql: 'DELETE FROM sessions WHERE session_code = ?',
        args: [sessionCode]
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  async cleanupExpiredSessions() {
    return cleanupExpiredSessions();
  },

  async debugGetAllUsers() {
    try {
      const result = await db.execute('SELECT * FROM bapi_users');
      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }


};