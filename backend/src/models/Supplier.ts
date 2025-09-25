import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type SupplierStatus = 'Active' | 'Inactive';

interface SupplierAttributes {
  id: number;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  paymentTerms?: string;
  rating: number;
  status: SupplierStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SupplierCreationAttributes extends Optional<SupplierAttributes, 'id' | 'contactPerson' | 'email' | 'phone' | 'address' | 'taxNumber' | 'paymentTerms' | 'rating' | 'createdAt' | 'updatedAt'> {}

class Supplier extends Model<SupplierAttributes, SupplierCreationAttributes> implements SupplierAttributes {
  public id!: number;
  public companyName!: string;
  public contactPerson?: string;
  public email?: string;
  public phone?: string;
  public address?: string;
  public taxNumber?: string;
  public paymentTerms?: string;
  public rating!: number;
  public status!: SupplierStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations will be defined in index.ts
}

Supplier.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contactPerson: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    taxNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    paymentTerms: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
    },
  },
  {
    sequelize,
    modelName: 'Supplier',
    tableName: 'suppliers',
    indexes: [
      { fields: ['status'] },
      { fields: ['rating'] },
    ],
  }
);

export { Supplier };