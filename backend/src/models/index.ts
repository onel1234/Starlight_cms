// Import all models
import { User } from './User';
import { UserProfile } from './UserProfile';
import { Project } from './Project';
import { Task } from './Task';
import { TaskDependency } from './TaskDependency';
import { TaskApproval } from './TaskApproval';
import { TimeLog } from './TimeLog';
import { Category } from './Category';
import { Supplier } from './Supplier';
import { Product } from './Product';
import { Quotation } from './Quotation';
import { QuotationItem } from './QuotationItem';
import { ProjectApproval } from './ProjectApproval';

// Define associations
const setupAssociations = () => {
  // User associations
  User.hasOne(UserProfile, { foreignKey: 'userId', as: 'profile' });
  UserProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  User.hasMany(Project, { foreignKey: 'clientId', as: 'clientProjects' });
  User.hasMany(Project, { foreignKey: 'projectManagerId', as: 'managedProjects' });
  User.hasMany(Project, { foreignKey: 'createdBy', as: 'createdProjects' });

  User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
  User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });

  User.hasMany(Quotation, { foreignKey: 'customerId', as: 'quotations' });
  User.hasMany(Quotation, { foreignKey: 'createdBy', as: 'createdQuotations' });

  User.hasMany(ProjectApproval, { foreignKey: 'approverId', as: 'projectApprovals' });

  // Project associations
  Project.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
  Project.belongsTo(User, { foreignKey: 'projectManagerId', as: 'projectManager' });
  Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

  Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
  Project.hasMany(Quotation, { foreignKey: 'projectId', as: 'quotations' });
  Project.hasMany(ProjectApproval, { foreignKey: 'projectId', as: 'approvals' });

  // Task associations
  Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
  Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
  Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  Task.hasMany(TaskDependency, { foreignKey: 'taskId', as: 'dependencies' });
  Task.hasMany(TaskDependency, { foreignKey: 'dependsOnTaskId', as: 'dependents' });
  Task.hasMany(TaskApproval, { foreignKey: 'taskId', as: 'approvals' });
  Task.hasMany(TimeLog, { foreignKey: 'taskId', as: 'timeLogs' });

  // TaskDependency associations
  TaskDependency.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
  TaskDependency.belongsTo(Task, { foreignKey: 'dependsOnTaskId', as: 'dependsOnTask' });

  // TaskApproval associations
  TaskApproval.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
  TaskApproval.belongsTo(User, { foreignKey: 'requestedBy', as: 'requester' });
  TaskApproval.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

  // TimeLog associations
  TimeLog.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
  TimeLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User associations for task-related models
  User.hasMany(TaskApproval, { foreignKey: 'requestedBy', as: 'requestedTaskApprovals' });
  User.hasMany(TaskApproval, { foreignKey: 'approvedBy', as: 'approvedTaskApprovals' });
  User.hasMany(TimeLog, { foreignKey: 'userId', as: 'timeLogs' });

  // Category associations
  Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });
  Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

  // Supplier associations
  Supplier.hasMany(Product, { foreignKey: 'supplierId', as: 'products' });

  // Product associations
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
  Product.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
  Product.hasMany(QuotationItem, { foreignKey: 'productId', as: 'quotationItems' });

  // Quotation associations
  Quotation.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
  Quotation.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
  Quotation.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  Quotation.hasMany(QuotationItem, { foreignKey: 'quotationId', as: 'items' });

  // QuotationItem associations
  QuotationItem.belongsTo(Quotation, { foreignKey: 'quotationId', as: 'quotation' });
  QuotationItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  // ProjectApproval associations
  ProjectApproval.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
  ProjectApproval.belongsTo(User, { foreignKey: 'approverId', as: 'approver' });
};

// Setup associations
setupAssociations();

// Export all models
export {
  User,
  UserProfile,
  Project,
  Task,
  TaskDependency,
  TaskApproval,
  TimeLog,
  Category,
  Supplier,
  Product,
  Quotation,
  QuotationItem,
  ProjectApproval,
  setupAssociations,
};

// Export types
export type { UserRole, UserStatus } from './User';
export type { ProjectStatus } from './Project';
export type { TaskStatus, TaskPriority } from './Task';
export type { ApprovalStatus as TaskApprovalStatus } from './TaskApproval';
export type { SupplierStatus } from './Supplier';
export type { ProductStatus } from './Product';
export type { QuotationStatus } from './Quotation';
export type { ApprovalStatus, ApprovalLevel } from './ProjectApproval';