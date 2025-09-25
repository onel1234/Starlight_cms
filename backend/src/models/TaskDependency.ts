import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TaskDependencyAttributes {
    id: number;
    taskId: number;
    dependsOnTaskId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface TaskDependencyCreationAttributes extends Optional<TaskDependencyAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class TaskDependency extends Model<TaskDependencyAttributes, TaskDependencyCreationAttributes> implements TaskDependencyAttributes {
    public id!: number;
    public taskId!: number;
    public dependsOnTaskId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

TaskDependency.init(
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
        dependsOnTaskId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tasks',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
    },
    {
        sequelize,
        modelName: 'TaskDependency',
        tableName: 'task_dependencies',
        indexes: [
            { fields: ['taskId'] },
            { fields: ['dependsOnTaskId'] },
            { 
                fields: ['taskId', 'dependsOnTaskId'], 
                unique: true,
                name: 'unique_task_dependency'
            },
        ],
        validate: {
            // Prevent self-dependency
            notSelfDependent() {
                if (this.taskId === this.dependsOnTaskId) {
                    throw new Error('A task cannot depend on itself');
                }
            }
        }
    }
);

export { TaskDependency };