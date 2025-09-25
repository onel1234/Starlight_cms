import { Router } from 'express';

const router = Router();

// Placeholder routes - will be implemented in later tasks
router.get('/dashboard', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/export', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export { router as reportRoutes };