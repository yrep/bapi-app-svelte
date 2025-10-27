import { DB } from './db.js';
import crypto from 'crypto';

export async function handleLogin(req, res) {
  try {
    const { userKey } = req.body;

    if (!userKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'User key is required' 
      });
    }

    const user = await DB.getUserByKey(userKey.trim());
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid user key' 
      });
    }

    if (user.disabled) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account disabled' 
      });
    }

    const sessionCode = crypto.randomBytes(32).toString('hex');
    await DB.createSession(user.id, sessionCode);

    res.cookie('bapi_session', sessionCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        role: user.role,
        key: user.key
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

export async function handleCheckAuth(req, res) {
  try {
    const sessionCode = req.cookies.bapi_session;

    if (!sessionCode) {
      return res.json({ authenticated: false });
    }

    const session = await DB.getSessionWithUser(sessionCode);
    
    if (!session) {
      res.clearCookie('bapi_session');
      return res.json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      user: {
        id: session.user_id,
        role: session.role,
        key: session.user_key
      }
    });

  } catch (error) {
    console.error('Check auth error:', error);
    res.json({ authenticated: false });
  }
}

export async function handleLogout(req, res) {
  try {
    const sessionCode = req.cookies.bapi_session;
    
    if (sessionCode) {
      await DB.deleteSession(sessionCode);
    }

    res.clearCookie('bapi_session');
    res.json({ success: true });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false });
  }
}