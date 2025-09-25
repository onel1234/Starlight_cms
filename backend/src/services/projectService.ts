import { Op, WhereOptions, Order } from 'sequelize';
import { Project, ProjectStatus } from '../models/Project';
import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { Task } from '../models/Task';
import { ProjectApproval, ApprovalStatus, ApprovalLevel } from '../models/ProjectApproval';
import { NotFoundError, ValidationError, AuthorizationError } from '../middleware/errorHandler';
import { emailService } from './emailService';

interface ProjectFilters {
    status?: ProjectStatus | ProjectStatus[];
    clientId?: number;
    projectManagerId?: number;
    startDate?: Date;
    endDate?: Date;
    search?: string;
}

interface ProjectCreateData {
    name: string;
    description?: string;
    clientId?: number;
    projectManagerId?: number;
    startDate: Date;
    endDate: Date;
    budget: number;
    location?: string;
    projectType?: string;
    createdBy: number;
}

interface ProjectUpdateData {
    name?: string;
    description?: string;
    clientId?: number;
    projectManagerId?: number;
    startDate?: Date;
    endDate?: Date;
    budget?: number;
    actualCost?: number;
    status?: ProjectStatus;
    location?: string;
    projectType?: string;
}

interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

interface ProjectListResponse {
    projects: Project[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class ProjectService {
    async createProject(data: ProjectCreateData): Promise<Project> {
        // Validate dates
        if (new Date(data.startDate) >= new Date(data.endDate)) {
            throw new ValidationError('End date must be after start date');
        }

        // Validate client exists and has Customer role
        if (data.clientId) {
            const client = await User.findByPk(data.clientId);
            if (!client) {
                throw new ValidationError('Client not found');
            }
            if (client.role !== 'Customer') {
                throw new ValidationError('Client must have Customer role');
            }
        }

        // Validate project manager exists and has appropriate role
        if (data.projectManagerId) {
            const projectManager = await User.findByPk(data.projectManagerId);
            if (!projectManager) {
                throw new ValidationError('Project manager not found');
            }
            if (!['Director', 'Project Manager'].includes(projectManager.role)) {
                throw new ValidationError('Project manager must have Director or Project Manager role');
            }
        }

        // Create project
        const project = await Project.create({
            ...data,
            status: 'Planning' as ProjectStatus
        });

        // Send notifications
        await this.sendProjectNotifications(project, 'created');

        return await this.getProjectById(project.id);
    }

    async getProjects(
        filters: ProjectFilters = {},
        pagination: PaginationOptions = {},
        userRole?: string,
        userId?: number
    ): Promise<ProjectListResponse> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = pagination;

        const offset = (page - 1) * limit;

        // Build where clause
        const where: WhereOptions = {};

        // Apply role-based filtering
        if (userRole === 'Customer' && userId) {
            where.clientId = userId;
        } else if (userRole === 'Project Manager' && userId) {
            where.projectManagerId = userId;
        }

        // Apply filters
        if (filters.status) {
            if (Array.isArray(filters.status)) {
                where.status = { [Op.in]: filters.status };
            } else {
                where.status = filters.status;
            }
        }

        if (filters.clientId) {
            where.clientId = filters.clientId;
        }

        if (filters.projectManagerId) {
            where.projectManagerId = filters.projectManagerId;
        }

        if (filters.startDate || filters.endDate) {
            const dateFilter: any = {};
            if (filters.startDate) {
                dateFilter[Op.gte] = filters.startDate;
            }
            if (filters.endDate) {
                dateFilter[Op.lte] = filters.endDate;
            }
            where.startDate = dateFilter;
        }

        if (filters.search) {
            (where as any)[Op.or] = [
                { name: { [Op.like]: `%${filters.search}%` } },
                { description: { [Op.like]: `%${filters.search}%` } },
                { location: { [Op.like]: `%${filters.search}%` } },
                { projectType: { [Op.like]: `%${filters.search}%` } }
            ];
        }

        // Build order clause
        const order: Order = [[sortBy, sortOrder]];

        // Execute query
        const { rows: projects, count: total } = await Project.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'client',
                    include: [{ model: UserProfile, as: 'profile' }]
                },
                {
                    model: User,
                    as: 'projectManager',
                    include: [{ model: UserProfile, as: 'profile' }]
                },
                {
                    model: User,
                    as: 'creator',
                    include: [{ model: UserProfile, as: 'profile' }]
                }
            ],
            order,
            limit,
            offset,
            distinct: true
        });

        const totalPages = Math.ceil(total / limit);

        return {
            projects,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async getProjectById(id: number, userRole?: string, userId?: number): Promise<Project> {
        const project = await Project.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'client',
                    include: [{ model: UserProfile, as: 'profile' }]
                },
                {
                    model: User,
                    as: 'projectManager',
                    include: [{ model: UserProfile, as: 'profile' }]
                },
                {
                    model: User,
                    as: 'creator',
                    include: [{ model: UserProfile, as: 'profile' }]
                },
                {
                    model: Task,
                    as: 'tasks',
                    include: [
                        {
                            model: User,
                            as: 'assignee',
                            include: [{ model: UserProfile, as: 'profile' }]
                        }
                    ]
                }
            ]
        });

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        // Check access permissions
        if (userRole === 'Customer' && userId !== project.clientId) {
            throw new AuthorizationError('You can only access your own projects');
        }

        if (userRole === 'Project Manager' && userId !== project.projectManagerId) {
            throw new AuthorizationError('You can only access projects you manage');
        }

        return project;
    }

    async updateProject(
        id: number,
        data: ProjectUpdateData,
        userRole?: string,
        userId?: number
    ): Promise<Project> {
        const project = await this.getProjectById(id, userRole, userId);

        // Check permissions for updates
        if (userRole === 'Customer') {
            throw new AuthorizationError('Customers cannot update projects');
        }

        if (userRole === 'Project Manager' && userId !== project.projectManagerId) {
            throw new AuthorizationError('You can only update projects you manage');
        }

        // Validate status transitions
        if (data.status && data.status !== project.status) {
            this.validateStatusTransition(project.status, data.status, userRole);
        }

        // Validate dates if provided
        if (data.startDate || data.endDate) {
            const startDate = data.startDate || project.startDate;
            const endDate = data.endDate || project.endDate;

            if (new Date(startDate) >= new Date(endDate)) {
                throw new ValidationError('End date must be after start date');
            }
        }

        // Validate client if changed
        if (data.clientId && data.clientId !== project.clientId) {
            const client = await User.findByPk(data.clientId);
            if (!client || client.role !== 'Customer') {
                throw new ValidationError('Invalid client');
            }
        }

        // Validate project manager if changed
        if (data.projectManagerId && data.projectManagerId !== project.projectManagerId) {
            const projectManager = await User.findByPk(data.projectManagerId);
            if (!projectManager || !['Director', 'Project Manager'].includes(projectManager.role)) {
                throw new ValidationError('Invalid project manager');
            }
        }

        // Update project
        await project.update(data);

        // Send notifications for status changes
        if (data.status && data.status !== project.status) {
            await this.sendProjectNotifications(project, 'status_changed', data.status);
        }

        return await this.getProjectById(id);
    }

    async deleteProject(id: number, userRole?: string, userId?: number): Promise<void> {
        const project = await this.getProjectById(id, userRole, userId);

        // Only Directors can delete projects
        if (userRole !== 'Director') {
            throw new AuthorizationError('Only Directors can delete projects');
        }

        // Cannot delete projects with tasks
        const taskCount = await Task.count({ where: { projectId: id } });
        if (taskCount > 0) {
            throw new ValidationError('Cannot delete project with existing tasks');
        }

        await project.destroy();

        // Send notifications
        await this.sendProjectNotifications(project, 'deleted');
    }

    async getProjectStats(projectId: number): Promise<any> {
        const project = await this.getProjectById(projectId);

        // Get task statistics
        const taskStats = await Task.findAll({
            where: { projectId },
            attributes: [
                'status',
                [Task.sequelize!.fn('COUNT', '*'), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Calculate budget utilization
        const budgetUtilization = project.actualCost / project.budget * 100;

        // Calculate project progress based on tasks
        const totalTasks = await Task.count({ where: { projectId } });
        const completedTasks = await Task.count({
            where: { projectId, status: 'Completed' }
        });
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Calculate timeline progress
        const now = new Date();
        const totalDuration = project.endDate.getTime() - project.startDate.getTime();
        const elapsed = now.getTime() - project.startDate.getTime();
        const timelineProgress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

        // Calculate budget variance
        const budgetVariance = project.actualCost - project.budget;
        const budgetVariancePercentage = (budgetVariance / project.budget) * 100;

        // Calculate schedule variance (simplified)
        const scheduleVariance = timelineProgress - progress;

        // Get approval status
        const approvals = await ProjectApproval.findAll({
            where: { projectId },
            include: [{ model: User, as: 'approver', include: [{ model: UserProfile, as: 'profile' }] }]
        });

        const approvalSummary = {
            total: approvals.length,
            pending: approvals.filter(a => a.status === 'Pending').length,
            approved: approvals.filter(a => a.status === 'Approved').length,
            rejected: approvals.filter(a => a.status === 'Rejected').length,
            approvals: approvals.map(a => ({
                id: a.id,
                level: a.approvalLevel,
                status: a.status,
                approver: (a as any).approver?.profile ?
                    `${(a as any).approver.profile.firstName} ${(a as any).approver.profile.lastName}` :
                    'Unknown',
                approvedAt: a.approvedAt,
                comments: a.comments
            }))
        };

        return {
            project: {
                id: project.id,
                name: project.name,
                status: project.status,
                budget: project.budget,
                actualCost: project.actualCost,
                budgetUtilization,
                budgetVariance,
                budgetVariancePercentage,
                progress,
                timelineProgress,
                scheduleVariance,
                startDate: project.startDate,
                endDate: project.endDate
            },
            tasks: {
                total: totalTasks,
                byStatus: taskStats.reduce((acc: any, stat: any) => {
                    acc[stat.status] = parseInt(stat.count);
                    return acc;
                }, {})
            },
            approvals: approvalSummary
        };
    }

    async getProjectTimeline(projectId: number): Promise<any> {
        const project = await this.getProjectById(projectId);

        const tasks = await Task.findAll({
            where: { projectId },
            include: [
                { model: User, as: 'assignee', include: [{ model: UserProfile, as: 'profile' }] }
            ],
            order: [['startDate', 'ASC']]
        });

        // Calculate critical path (simplified)
        const timelineData = {
            project: {
                id: project.id,
                name: project.name,
                startDate: project.startDate,
                endDate: project.endDate,
                status: project.status
            },
            tasks: tasks.map(task => ({
                id: task.id,
                title: task.title,
                startDate: task.startDate,
                dueDate: task.dueDate,
                status: task.status,
                progress: task.completionPercentage,
                assignee: (task as any).assignee?.profile ?
                    `${(task as any).assignee.profile.firstName} ${(task as any).assignee.profile.lastName}` :
                    'Unassigned',
                priority: task.priority
            })),
            milestones: this.calculateProjectMilestones(project, tasks)
        };

        return timelineData;
    }

    async updateProjectBudget(
        projectId: number,
        actualCost: number,
        userId: number,
        userRole: string
    ): Promise<Project> {
        const project = await this.getProjectById(projectId, userRole, userId);

        // Only project managers and directors can update budget
        if (!['Director', 'Project Manager'].includes(userRole)) {
            throw new AuthorizationError('Only Directors and Project Managers can update project budget');
        }

        if (userRole === 'Project Manager' && userId !== project.projectManagerId) {
            throw new AuthorizationError('Project Managers can only update budgets for their own projects');
        }

        if (actualCost < 0) {
            throw new ValidationError('Actual cost cannot be negative');
        }

        await project.update({ actualCost });

        // Send budget alert if over budget
        if (actualCost > project.budget) {
            await this.sendBudgetAlertNotification(project, actualCost);
        }

        return await this.getProjectById(projectId);
    }

    private calculateProjectMilestones(project: Project, tasks: Task[]): any[] {
        const milestones = [];

        // Project start milestone
        milestones.push({
            id: 'start',
            title: 'Project Start',
            date: project.startDate,
            status: 'completed',
            type: 'start'
        });

        // Task-based milestones (25%, 50%, 75% completion)
        const totalTasks = tasks.length;
        if (totalTasks > 0) {
            const completedTasks = tasks.filter(t => t.status === 'Completed').length;
            const completionPercentage = (completedTasks / totalTasks) * 100;

            [25, 50, 75].forEach(milestone => {
                milestones.push({
                    id: `milestone-${milestone}`,
                    title: `${milestone}% Complete`,
                    date: this.estimateMilestoneDate(project, milestone),
                    status: completionPercentage >= milestone ? 'completed' : 'pending',
                    type: 'milestone'
                });
            });
        }

        // Project end milestone
        milestones.push({
            id: 'end',
            title: 'Project Completion',
            date: project.endDate,
            status: project.status === 'Completed' ? 'completed' : 'pending',
            type: 'end'
        });

        return milestones;
    }

    private estimateMilestoneDate(project: Project, percentage: number): Date {
        const totalDuration = project.endDate.getTime() - project.startDate.getTime();
        const milestoneTime = project.startDate.getTime() + (totalDuration * percentage / 100);
        return new Date(milestoneTime);
    }

    private async sendBudgetAlertNotification(project: Project, actualCost: number): Promise<void> {
        try {
            const recipients: number[] = [];

            if (project.projectManagerId) recipients.push(project.projectManagerId);
            if (project.clientId) recipients.push(project.clientId);

            // Also notify directors
            const directors = await User.findAll({
                where: { role: 'Director', status: 'Active' }
            });
            recipients.push(...directors.map(d => d.id));

            const users = await User.findAll({
                where: { id: recipients },
                include: [{ model: UserProfile, as: 'profile' }]
            });

            const overBudgetAmount = actualCost - project.budget;
            const overBudgetPercentage = (overBudgetAmount / project.budget) * 100;

            for (const user of users) {
                const firstName = (user as any).profile?.firstName || 'User';
                await emailService.sendBudgetAlertNotification(
                    user.email,
                    firstName,
                    project.name,
                    project.budget,
                    actualCost,
                    overBudgetAmount,
                    overBudgetPercentage
                );
            }
        } catch (error) {
            console.error('Failed to send budget alert notifications:', error);
        }
    }

    async approveProject(id: number, userId: number, userRole: string): Promise<Project> {
        if (userRole !== 'Director') {
            throw new AuthorizationError('Only Directors can approve projects');
        }

        const project = await this.getProjectById(id);

        if (project.status !== 'Planning') {
            throw new ValidationError('Only projects in Planning status can be approved');
        }

        await project.update({ status: 'In Progress' });

        // Send approval notifications
        await this.sendProjectNotifications(project, 'approved');

        return await this.getProjectById(id);
    }

    async requestProjectApproval(
        projectId: number,
        requesterId: number,
        requesterRole: string
    ): Promise<ProjectApproval[]> {
        const project = await this.getProjectById(projectId);

        if (project.status !== 'Planning') {
            throw new ValidationError('Only projects in Planning status can request approval');
        }

        // Check if approval is already requested
        const existingApprovals = await ProjectApproval.findAll({
            where: { projectId, status: 'Pending' }
        });

        if (existingApprovals.length > 0) {
            throw new ValidationError('Approval request already exists for this project');
        }

        // Define approval workflow based on project budget
        const approvalLevels: ApprovalLevel[] = [];

        if (project.budget > 1000000) {
            // High-value projects need all levels
            approvalLevels.push('Project Manager', 'Director', 'Senior Director');
        } else if (project.budget > 500000) {
            // Medium-value projects need PM and Director
            approvalLevels.push('Project Manager', 'Director');
        } else {
            // Low-value projects need only Director
            approvalLevels.push('Director');
        }

        // Find approvers for each level
        const approvers = await User.findAll({
            where: {
                role: { [Op.in]: approvalLevels },
                status: 'Active'
            },
            include: [{ model: UserProfile, as: 'profile' }]
        });

        // Create approval records
        const approvals: ProjectApproval[] = [];

        for (const level of approvalLevels) {
            const approver = approvers.find(u => u.role === level);
            if (approver) {
                const approval = await ProjectApproval.create({
                    projectId,
                    approverId: approver.id,
                    approvalLevel: level,
                    status: 'Pending'
                });
                approvals.push(approval);
            }
        }

        // Send notification emails to approvers
        await this.sendApprovalRequestNotifications(project, approvals);

        return approvals;
    }

    async processProjectApproval(
        approvalId: number,
        approverId: number,
        decision: 'Approved' | 'Rejected',
        comments?: string
    ): Promise<{ approval: ProjectApproval; project?: Project }> {
        const approval = await ProjectApproval.findByPk(approvalId, {
            include: [
                { model: Project, as: 'project' },
                { model: User, as: 'approver', include: [{ model: UserProfile, as: 'profile' }] }
            ]
        });

        if (!approval) {
            throw new NotFoundError('Approval request not found');
        }

        if (approval.approverId !== approverId) {
            throw new AuthorizationError('You can only process your own approval requests');
        }

        if (approval.status !== 'Pending') {
            throw new ValidationError('This approval request has already been processed');
        }

        // Update approval record
        await approval.update({
            status: decision,
            comments,
            approvedAt: new Date()
        });

        const project = (approval as any).project as Project;

        if (decision === 'Rejected') {
            // If rejected, reject all pending approvals and update project status
            await ProjectApproval.update(
                { status: 'Rejected', comments: 'Rejected due to previous rejection' },
                { where: { projectId: project.id, status: 'Pending' } }
            );

            await project.update({ status: 'On Hold' });

            // Send rejection notifications
            await this.sendApprovalDecisionNotifications(project, approval, 'Rejected');

            return { approval, project };
        }

        // Check if all required approvals are complete
        const allApprovals = await ProjectApproval.findAll({
            where: { projectId: project.id }
        });

        const pendingApprovals = allApprovals.filter(a => a.status === 'Pending');
        const approvedCount = allApprovals.filter(a => a.status === 'Approved').length;

        if (pendingApprovals.length === 0 && approvedCount === allApprovals.length) {
            // All approvals complete - approve project
            await project.update({ status: 'In Progress' });

            // Send final approval notification
            await this.sendProjectNotifications(project, 'approved');
        } else {
            // Send individual approval notification
            await this.sendApprovalDecisionNotifications(project, approval, 'Approved');
        }

        return { approval, project: pendingApprovals.length === 0 ? project : undefined };
    }

    async getProjectApprovals(projectId: number): Promise<ProjectApproval[]> {
        return await ProjectApproval.findAll({
            where: { projectId },
            include: [
                {
                    model: User,
                    as: 'approver',
                    include: [{ model: UserProfile, as: 'profile' }]
                }
            ],
            order: [['createdAt', 'ASC']]
        });
    }

    async getPendingApprovals(userId: number): Promise<ProjectApproval[]> {
        return await ProjectApproval.findAll({
            where: {
                approverId: userId,
                status: 'Pending'
            },
            include: [
                {
                    model: Project,
                    as: 'project',
                    include: [
                        { model: User, as: 'client', include: [{ model: UserProfile, as: 'profile' }] },
                        { model: User, as: 'projectManager', include: [{ model: UserProfile, as: 'profile' }] }
                    ]
                }
            ],
            order: [['createdAt', 'ASC']]
        });
    }

    private validateStatusTransition(
        currentStatus: ProjectStatus,
        newStatus: ProjectStatus,
        userRole?: string
    ): void {
        const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
            'Planning': ['In Progress', 'On Hold'],
            'In Progress': ['On Hold', 'Completed'],
            'On Hold': ['In Progress', 'Planning'],
            'Completed': ['Closed'],
            'Closed': [] // No transitions from closed
        };

        if (!allowedTransitions[currentStatus].includes(newStatus)) {
            throw new ValidationError(
                `Invalid status transition from ${currentStatus} to ${newStatus}`
            );
        }

        // Only Directors can close projects
        if (newStatus === 'Closed' && userRole !== 'Director') {
            throw new AuthorizationError('Only Directors can close projects');
        }
    }

    private async sendProjectNotifications(
        project: Project,
        action: 'created' | 'status_changed' | 'approved' | 'deleted',
        newStatus?: ProjectStatus
    ): Promise<void> {
        try {
            const recipients: number[] = [];

            // Add project manager
            if (project.projectManagerId) {
                recipients.push(project.projectManagerId);
            }

            // Add client
            if (project.clientId) {
                recipients.push(project.clientId);
            }

            if (recipients.length === 0) return;

            // Get recipient details
            const users = await User.findAll({
                where: { id: recipients },
                include: [{ model: UserProfile, as: 'profile' }]
            });

            // Send emails
            for (const user of users) {
                const firstName = (user as any).profile?.firstName || 'User';

                switch (action) {
                    case 'created':
                        await emailService.sendProjectCreatedNotification(
                            user.email,
                            firstName,
                            project.name
                        );
                        break;
                    case 'status_changed':
                        await emailService.sendProjectStatusChangeNotification(
                            user.email,
                            firstName,
                            project.name,
                            newStatus!
                        );
                        break;
                    case 'approved':
                        await emailService.sendProjectApprovedNotification(
                            user.email,
                            firstName,
                            project.name
                        );
                        break;
                }
            }
        } catch (error) {
            // Log error but don't fail the operation
            console.error('Failed to send project notifications:', error);
        }
    }

    private async sendApprovalRequestNotifications(
        project: Project,
        approvals: ProjectApproval[]
    ): Promise<void> {
        try {
            for (const approval of approvals) {
                const approver = await User.findByPk(approval.approverId, {
                    include: [{ model: UserProfile, as: 'profile' }]
                });

                if (approver) {
                    const firstName = (approver as any).profile?.firstName || 'User';
                    await emailService.sendApprovalRequestNotification(
                        approver.email,
                        firstName,
                        project.name,
                        approval.approvalLevel,
                        project.budget
                    );
                }
            }
        } catch (error) {
            console.error('Failed to send approval request notifications:', error);
        }
    }

    private async sendApprovalDecisionNotifications(
        project: Project,
        approval: ProjectApproval,
        decision: 'Approved' | 'Rejected'
    ): Promise<void> {
        try {
            // Notify project stakeholders
            const recipients: number[] = [];

            if (project.projectManagerId) recipients.push(project.projectManagerId);
            if (project.clientId) recipients.push(project.clientId);
            if (project.createdBy) recipients.push(project.createdBy);

            const users = await User.findAll({
                where: { id: recipients },
                include: [{ model: UserProfile, as: 'profile' }]
            });

            const approver = await User.findByPk(approval.approverId, {
                include: [{ model: UserProfile, as: 'profile' }]
            });

            const approverName = (approver as any)?.profile?.firstName || 'Approver';

            for (const user of users) {
                const firstName = (user as any).profile?.firstName || 'User';
                await emailService.sendApprovalDecisionNotification(
                    user.email,
                    firstName,
                    project.name,
                    decision,
                    approval.approvalLevel,
                    approverName,
                    approval.comments
                );
            }
        } catch (error) {
            console.error('Failed to send approval decision notifications:', error);
        }
    }
}

export const projectService = new ProjectService();