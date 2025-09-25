import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserProfileAttributes {
  userId: number;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  companyName?: string;
  position?: string;
  avatarUrl?: string;
}

interface UserProfileCreationAttributes extends Optional<UserProfileAttributes, 'phone' | 'address' | 'companyName' | 'position' | 'avatarUrl'> {}

class UserProfile extends Model<UserProfileAttributes, UserProfileCreationAttributes> implements UserProfileAttributes {
  public userId!: number;
  public firstName!: string;
  public lastName!: string;
  public phone?: string;
  public address?: string;
  public companyName?: string;
  public position?: string;
  public avatarUrl?: string;

  // Virtual fields
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

UserProfile.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'UserProfile',
    tableName: 'user_profiles',
    timestamps: false,
  }
);

export { UserProfile };