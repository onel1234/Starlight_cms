import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TimeLogAttributes {
    id: number;
    taskId: number;
    userId: number;
    startTime: Date;
    endTime?: Date;
    duration?: number; // in minutes
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface TimeLogCreationAttributes extends Optional<TimeLogAttributes, 'id' | 'endTime' | 'duration' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'> { }

class TimeLog extends Model<TimeLogAttributes, TimeLogCreationAttributes> implements TimeLogAttributes {
    public id!: number;
    public taskId!: number;
    public userId!: number;
    public startTime!: Date;
    public endTime?: Date;
    public duration?: number;
    public description?: string;
    public isActive!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Instance method to calculate duration
    public calculateDuration(): number {
        if (!this.endTime) {
            return 0;
        }
        return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60)); // minutes
    }

    // Instance method to stop time logging
    public async stopLogging(): Promise<void> {
        if (this.isActive && !this.endTime) {
            this.endTime = new Date();
            this.duration = this.calculateDuration();
            this.isActive = false;
            await this.save();
        }
    }
}

TimeLog.init(
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
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        duration: {
            type: DataTypes.INTEGER, // minutes
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'TimeLog',
        tableName: 'time_logs',
        indexes: [
            { fields: ['taskId'] },
            { fields: ['userId'] },
            { fields: ['startTime'] },
            { fields: ['isActive'] },
            { fields: ['taskId', 'userId'] },
        ],
        hooks: {
            beforeSave: (timeLog: TimeLog) => {
                // Auto-calculate duration if endTime is set
                if (timeLog.endTime && !timeLog.duration) {
                    timeLog.duration = timeLog.calculateDuration();
                }
                // Set isActive to false if endTime is set
                if (timeLog.endTime) {
                    timeLog.isActive = false;
                }
            }
        }
    }
);

export { TimeLog };