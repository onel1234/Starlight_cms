import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Declined';

interface TaskApprovalAttributes {
    id: number;
    taskId: number;
    requestedBy: number;
    approvedBy?: number;
    status: ApprovalStatus;
    comments?: string;
    requestedAt: Date;
    respondedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

interface TaskApprovalCreationAttributes extends Optional<TaskApprovalAttributes, 'id' | 'approvedBy' | 'comments' | 'respondedAt' | 'createdAt' | 'updatedAt'> { }

class TaskApproval extends Model<TaskApprovalAttributes, TaskApprovalCreationAttributes> implements TaskApprovalAttributes {
    public id!: number;
    public taskId!: number;
    public requestedBy!: number;
    public approvedBy?: number;
    public status!: ApprovalStatus;
    public comments?: string;
    public requestedAt!: Date;
    public respondedAt?: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

TaskApproval.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        taskId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tasks',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        requestedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        approvedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Approved', 'Declined'),
            allowNull: false,
            defaultValue: 'Pending',
        },
        comments: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        requestedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        respondedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'TaskApproval',
        tableName: 'task_approvals',
        indexes: [
            { fields: ['taskId'] },
            { fields: ['requestedBy'] },
            { fields: ['approvedBy'] },
            { fields: ['status'] },
            { fields: ['requestedAt'] },
        ],
    }
);

export { TaskApproval };