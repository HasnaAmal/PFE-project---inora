// routes/drafts.js
import express      from 'express';
import auth  from '../Middlewares/auth.js';
import { prisma } from '../lib/prisma.js'; 
const router = express.Router();

// ── GET /api/drafts ─────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const draft = await prisma.draft.findFirst({
      where:   { userId: req.user.id },
      orderBy: { lastSavedAt: 'desc' },
    });
    res.json(draft || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/drafts ─────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { formData } = req.body;

    const existing = await prisma.draft.findFirst({
      where: { userId: req.user.id },
    });

    const draft = existing
      ? await prisma.draft.update({
          where: { id: existing.id },
          data:  { formData },
        })
      : await prisma.draft.create({
          data: { userId: req.user.id, formData },
        });

    res.json(draft);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/drafts/:id ───────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.draft.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
