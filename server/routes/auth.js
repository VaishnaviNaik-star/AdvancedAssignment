import { Router } from 'express';
import User from '../models/User.js';
import { hash, compare, token } from '../utils/auth.js';
import { protect } from '../middleware/auth.js';

const r = Router();

const cleanEmail = (email = '') => email.trim().toLowerCase();

r.post('/register', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      academicYear,
      section,
      subjects = [],
      facultyCode
    } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must contain at least 6 characters.' });
    }

    if (!['student', 'professor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid account type.' });
    }

    if (role === 'professor') {
      if (!process.env.FACULTY_SIGNUP_CODE) {
        return res.status(403).json({ message: 'Faculty self-registration is currently disabled.' });
      }
      if (facultyCode !== process.env.FACULTY_SIGNUP_CODE) {
        return res.status(403).json({ message: 'Invalid faculty access code.' });
      }
    }

    if (role === 'student' && (!academicYear?.trim() || !section?.trim())) {
      return res.status(400).json({ message: 'Academic year and section are required for students.' });
    }

    const normalizedEmail = cleanEmail(email);
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const uniqueSubjects = [...new Set((Array.isArray(subjects) ? subjects : [])
      .map(s => String(s).trim())
      .filter(Boolean))];

    const u = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await hash(password),
      role,
      academicYear: role === 'student' ? academicYear.trim() : undefined,
      section: role === 'student' ? section.trim().toUpperCase() : undefined,
      subjects: uniqueSubjects
    });

    res.status(201).json({ token: token(u._id), user: safe(u) });
  } catch (e) {
    next(e);
  }
});

r.post('/login', async (req, res, next) => {
  try {
    const email = cleanEmail(req.body.email);
    const u = await User.findOne({ email });

    if (!u || !(await compare(req.body.password || '', u.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({ token: token(u._id), user: safe(u) });
  } catch (e) {
    next(e);
  }
});

r.get('/me', protect, (req, res) => res.json({ user: safe(req.user) }));

const safe = u => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  academicYear: u.academicYear,
  section: u.section,
  subjects: u.subjects,
  interventionFlags: u.interventionFlags
});

export default r;
