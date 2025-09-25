import { Router } from 'express';

const router = Router();

// Placeholder routes - will be implemented in later tasks
router.get('/products', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/categories', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/suppliers', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export { router as inventoryRoutes };