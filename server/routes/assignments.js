import { Router } from 'express';
import Assignment from '../models/Assignment.js';
import { protect, role } from '../middleware/auth.js';

const r = Router();

r.get('/', protect, async (req, res, next) => {
  try {
    const q = req.user.role === 'student'
      ? { academicYear: req.user.academicYear, section: req.user.section }
      : { professor: req.user._id };

    res.json(await Assignment.find(q)
      .populate('professor', 'name email')
      .sort({ deadline: 1 }));
  } catch (e) {
    next(e);
  }
});

r.post('/', protect, role('professor'), async (req, res, next) => {
  try {
    const { title, subject, description, academicYear, section, deadline, maxScore } = req.body;

    if (!title?.trim() || !subject?.trim() || !academicYear?.trim() || !section?.trim() || !deadline) {
      return res.status(400).json({ message: 'Title, subject, academic year, section and deadline are required.' });
    }

    const due = new Date(deadline);
    if (Number.isNaN(due.getTime()) || due <= new Date()) {
      return res.status(400).json({ message: 'Assignment deadline must be a valid future date and time.' });
    }

    if (Number(maxScore) <= 0) {
      return res.status(400).json({ message: 'Maximum score must be greater than 0.' });
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      subject: subject.trim(),
      description: description?.trim() || '',
      academicYear: academicYear.trim(),
      section: section.trim().toUpperCase(),
      deadline: due,
      maxScore: Number(maxScore) || 100,
      professor: req.user._id
    });

    res.status(201).json(assignment);
  } catch (e) {
    next(e);
  }
});

r.patch('/:id', protect, role('professor'), async (req, res, next) => {
  try {
    const a = await Assignment.findOneAndUpdate(
      { _id: req.params.id, professor: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!a) return res.status(404).json({ message: 'Assignment not found' });
    res.json(a);
  } catch (e) {
    next(e);
  }
});

export default r;
