import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type ApprovalLevel = 'Project Manager' | 'Director' | 'Senior Director';

interface ProjectApprovalAttributes {
  id: number;
  projectId: number;
  approverId: number;
  approvalLevel: ApprovalLevel;
  status: ApprovalStatus;
  comments?: string;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProjectApprovalCreationAttributes extends Optional<ProjectApprovalAttributes, 'id' | 'comments' | 'approvedAt' | 'createdAt' | 'updatedAt'> {}

class ProjectApproval extends Model<ProjectApprovalAttributes, ProjectApprovalCreationAttributes> implements ProjectApprovalAttributes {
  public id!: number;
  public projectId!: number;
  public approverId!: number;
  public approvalLevel!: ApprovalLevel;
  public status!: ApprovalStatus;
  public comments?: string;
  public approvedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  // Associations will be defined in index.ts
}

ProjectApproval.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'project_id', // Map to snake_case column in database
      references: {
        model: 'projects',
        key: 'id',
      },
    },
    approverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'approver_id', // Map to snake_case column in database
      references: {
        model: 'users',
        key: 'id',
      },
    },
    approvalLevel: {
      type: DataTypes.ENUM('Project Manager', 'Director', 'Senior Director'),
      allowNull: false,
      field: 'approval_level', // Map to snake_case column in database
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at', // Map to snake_case column in database
    },
  },
  {
    sequelize,
    modelName: 'ProjectApproval',
    tableName: 'project_approvals',
    underscored: true, // This tells Sequelize to use snake_case for database columns
    indexes: [
      { fields: ['project_id'] }, // Use snake_case for index fields
      { fields: ['approver_id'] }, // Use snake_case for index fields
      { fields: ['status'] },
      { fields: ['approval_level'] }, // Use snake_case for index fields
    ],
  }
);

export { ProjectApproval };