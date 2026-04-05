import { prisma } from '../lib/prisma.js';

export const getDraft = async (req, res) => {
  try {
    console.log('📝 [getDraft] User ID:', req.user?.id);
    
    const draft = await prisma.draft.findFirst({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    res.json(draft || {});
  } catch (error) {
    console.error('❌ Get draft error:', error);
    res.status(500).json({ message: 'Failed to load draft' });
  }
};

export const saveDraft = async (req, res) => {
  try {
    const { formData } = req.body;
    console.log('💾 [saveDraft] User ID:', req.user?.id);
    
    const draft = await prisma.draft.upsert({
      where: {
        userId: req.user.id,
      },
      update: {
        formData,
        updatedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        formData,
      },
    });
    
    res.json(draft);
  } catch (error) {
    console.error('❌ Save draft error:', error);
    res.status(500).json({ message: 'Failed to save draft' });
  }
};

export const deleteDraft = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ [deleteDraft] User ID:', req.user?.id, 'Draft ID:', id);
    
    await prisma.draft.deleteMany({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
    });
    
    res.json({ message: 'Draft deleted' });
  } catch (error) {
    console.error('❌ Delete draft error:', error);
    res.status(500).json({ message: 'Failed to delete draft' });
  }
};