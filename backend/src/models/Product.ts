import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type ProductStatus = 'Active' | 'Inactive';

interface ProductAttributes {
  id: number;
  categoryId?: number;
  name: string;
  description?: string;
  sku?: string;
  unitPrice: number;
  stockQuantity: number;
  minimumStock: number;
  unitOfMeasure?: string;
  supplierId?: number;
  imageUrls?: string[];
  specifications?: Record<string, any>;
  status: ProductStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'categoryId' | 'description' | 'sku' | 'stockQuantity' | 'minimumStock' | 'unitOfMeasure' | 'supplierId' | 'imageUrls' | 'specifications' | 'createdAt' | 'updatedAt'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public categoryId?: number;
  public name!: string;
  public description?: string;
  public sku?: string;
  public unitPrice!: number;
  public stockQuantity!: number;
  public minimumStock!: number;
  public unitOfMeasure?: string;
  public supplierId?: number;
  public imageUrls?: string[];
  public specifications?: Record<string, any>;
  public status!: ProductStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations will be defined in index.ts

  // Virtual fields
  public get isLowStock(): boolean {
    return this.stockQuantity <= this.minimumStock;
  }
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    minimumStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    unitOfMeasure: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'suppliers',
        key: 'id',
      },
    },
    imageUrls: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    indexes: [
      { fields: ['categoryId'] },
      { fields: ['supplierId'] },
      { fields: ['sku'] },
      { fields: ['stockQuantity'] },
      { fields: ['status'] },
    ],
  }
);

export { Product };