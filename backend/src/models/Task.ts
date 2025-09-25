import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

interface TaskAttributes {
    id: number;
    projectId: number;
    assignedTo?: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    startDate?: Date;
    dueDate?: Date;
    completionPercentage: number;
    estimatedHours?: number;
    actualHours: number;
    createdBy: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'assignedTo' | 'description' | 'startDate' | 'dueDate' | 'completionPercentage' | 'estimatedHours' | 'actualHours' | 'createdAt' | 'updatedAt'> { }

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
    public id!: number;
    public projectId!: number;
    public assignedTo?: number;
    public title!: string;
    public description?: string;
    public status!: TaskStatus;
    public priority!: TaskPriority;
    public startDate?: Date;
    public dueDate?: Date;
    public completionPercentage!: number;
    public estimatedHours?: number;
    public actualHours!: number;
    public createdBy!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations will be defined in index.ts
}

Task.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'projects',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        assignedTo: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed', 'On Hold'),
            allowNull: false,
            defaultValue: 'Not Started',
        },
        priority: {
            type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
            allowNull: false,
            defaultValue: 'Medium',
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        dueDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        completionPercentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100,
            },
        },
        estimatedHours: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: true,
        },
        actualHours: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: false,
            defaultValue: 0,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Task',
        tableName: 'tasks',
        indexes: [
            { fields: ['projectId'] },
            { fields: ['assignedTo'] },
            { fields: ['status'] },
            { fields: ['priority'] },
            { fields: ['dueDate'] },
            { fields: ['createdBy'] },
        ],
    }
);

export { Task };