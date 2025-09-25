import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authenticate, authorize, requireMinimumRole } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all projects with filtering, pagination, and search
router.get('/', projectController.getProjects);

// Search projects
router.get('/search', projectController.searchProjects);

// Get my projects (role-based filtering)
router.get('/my-projects', projectController.getMyProjects);

// Get projects by status
router.get('/status/:status', projectController.getProjectsByStatus);

// Create new project (Directors, Project Managers, Quantity Surveyors can create)
router.post('/', 
  requireMinimumRole('Quantity Surveyor'),
  projectController.createProject
);

// Get specific project by ID
router.get('/:id', projectController.getProjectById);

// Get project statistics
router.get('/:id/stats', projectController.getProjectStats);

// Update project (Directors, Project Managers can update)
router.put('/:id', 
  requireMinimumRole('Project Manager'),
  projectController.updateProject
);

// Approve project (Directors only)
router.patch('/:id/approve', 
  authorize('Director'),
  projectController.approveProject
);

// Delete project (Directors only)
router.delete('/:id', 
  authorize('Director'),
  projectController.deleteProject
);

// Multi-level approval workflow routes
router.post('/:id/request-approval',
  requireMinimumRole('Project Manager'),
  projectController.requestApproval
);

router.get('/:id/approvals',
  projectController.getProjectApprovals
);

router.post('/approvals/:approvalId/process',
  requireMinimumRole('Project Manager'),
  projectController.processApproval
);

router.get('/pending-approvals',
  requireMinimumRole('Project Manager'),
  projectController.getPendingApprovals
);

// Timeline and budget tracking routes
router.get('/:id/timeline',
  projectController.getProjectTimeline
);

router.patch('/:id/budget',
  requireMinimumRole('Project Manager'),
  projectController.updateProjectBudget
);

export { router as projectRoutes };