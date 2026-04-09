const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const userExists = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const validRole = role === 'authority' ? 'authority' : 'student';

    // Handle profile picture upload
    let profile_picture_url = null;
    if (req.file) {
      profile_picture_url = `/uploads/${req.file.filename}`;
    }

    const newUser = await pool.query(
      'INSERT INTO Users (name, email, password_hash, role, profile_picture_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, profile_picture_url',
      [name, email, password_hash, validRole, profile_picture_url]
    );

    const user = newUser.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_picture_url: user.profile_picture_url
      },
      token
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.updateProfile = async (req, res) => {
  const user_id = req.user.id;
  const { name } = req.body;

  try {
    let profile_picture_url = null;
    
    // Get current user data
    const currentUser = await pool.query('SELECT profile_picture_url FROM Users WHERE id = $1', [user_id]);
    if (currentUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Use new picture if provided, otherwise keep existing
    if (req.file) {
      profile_picture_url = `/uploads/${req.file.filename}`;
    } else {
      profile_picture_url = currentUser.rows[0].profile_picture_url;
    }

    const updateQuery = name
      ? 'UPDATE Users SET name = $2, profile_picture_url = $3 WHERE id = $1 RETURNING id, name, email, role, profile_picture_url'
      : 'UPDATE Users SET profile_picture_url = $2 WHERE id = $1 RETURNING id, name, email, role, profile_picture_url';

    const params = name ? [user_id, name, profile_picture_url] : [user_id, profile_picture_url];

    const updatedUser = await pool.query(updateQuery, params);
    
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser.rows[0]
    });
  } catch (err) {
    console.error('Update profile error', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

exports.getProfile = async (req, res) => {
  const user_id = req.user.id;

  try {
    const user = await pool.query(
      'SELECT id, name, email, role, profile_picture_url, created_at FROM Users WHERE id = $1',
      [user_id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error('Get profile error', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};
