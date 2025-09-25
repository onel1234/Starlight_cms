import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired';

interface QuotationAttributes {
  id: number;
  quotationNumber: string;
  customerId: number;
  projectId?: number;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  status: QuotationStatus;
  validUntil?: Date;
  notes?: string;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface QuotationCreationAttributes extends Optional<QuotationAttributes, 'id' | 'projectId' | 'taxAmount' | 'discountAmount' | 'validUntil' | 'notes' | 'createdAt' | 'updatedAt'> {}

class Quotation extends Model<QuotationAttributes, QuotationCreationAttributes> implements QuotationAttributes {
  public id!: number;
  public quotationNumber!: string;
  public customerId!: number;
  public projectId?: number;
  public totalAmount!: number;
  public taxAmount!: number;
  public discountAmount!: number;
  public status!: QuotationStatus;
  public validUntil?: Date;
  public notes?: string;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations will be defined in index.ts

  // Virtual fields
  public get finalAmount(): number {
    return this.totalAmount + this.taxAmount - this.discountAmount;
  }

  public get isExpired(): boolean {
    return this.validUntil ? new Date() > this.validUntil : false;
  }
}

Quotation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quotationNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id',
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('Draft', 'Sent', 'Approved', 'Rejected', 'Expired'),
      allowNull: false,
      defaultValue: 'Draft',
    },
    validUntil: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
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
    modelName: 'Quotation',
    tableName: 'quotations',
    indexes: [
      { fields: ['customerId'] },
      { fields: ['projectId'] },
      { fields: ['status'] },
      { fields: ['quotationNumber'] },
      { fields: ['createdBy'] },
    ],
  }
);

export { Quotation };