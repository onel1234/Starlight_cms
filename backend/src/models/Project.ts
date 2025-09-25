import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Closed';

interface ProjectAttributes {
  id: number;
  name: string;
  description?: string;
  clientId?: number;
  projectManagerId?: number;
  startDate: Date;
  endDate: Date;
  budget: number;
  actualCost: number;
  status: ProjectStatus;
  location?: string;
  projectType?: string;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id' | 'description' | 'clientId' | 'projectManagerId' | 'actualCost' | 'location' | 'projectType' | 'createdAt' | 'updatedAt'> {}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public clientId?: number;
  public projectManagerId?: number;
  public startDate!: Date;
  public endDate!: Date;
  public budget!: number;
  public actualCost!: number;
  public status!: ProjectStatus;
  public location?: string;
  public projectType?: string;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations will be defined in index.ts
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    projectManagerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    budget: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    actualCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('Planning', 'In Progress', 'On Hold', 'Completed', 'Closed'),
      allowNull: false,
      defaultValue: 'Planning',
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    projectType: {
      type: DataTypes.STRING(100),
      allowNull: true,
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
    modelName: 'Project',
    tableName: 'projects',
    indexes: [
      { fields: ['status'] },
      { fields: ['clientId'] },
      { fields: ['projectManagerId'] },
      { fields: ['startDate', 'endDate'] },
      { fields: ['createdBy'] },
    ],
  }
);

export { Project };