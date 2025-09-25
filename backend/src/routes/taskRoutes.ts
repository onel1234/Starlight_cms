import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Task CRUD operations
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Task progress update
router.patch('/:id/progress', taskController.updateProgress);

// Task approval workflow
router.post('/:id/approval-request', taskController.requestApproval);
router.put('/approvals/:approvalId/respond', taskController.respondToApproval);

// Time logging
router.post('/time-logs', taskController.startTimeLog);
router.put('/time-logs/:timeLogId/stop', taskController.stopTimeLog);
router.get('/:id/time-logs', taskController.getTaskTimeLogs);
router.get('/my-time-logs', taskController.getUserTimeLogs);

export { router as taskRoutes };