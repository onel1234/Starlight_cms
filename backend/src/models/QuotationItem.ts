import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface QuotationItemAttributes {
  id: number;
  quotationId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

interface QuotationItemCreationAttributes extends Optional<QuotationItemAttributes, 'id' | 'description'> {}

class QuotationItem extends Model<QuotationItemAttributes, QuotationItemCreationAttributes> implements QuotationItemAttributes {
  public id!: number;
  public quotationId!: number;
  public productId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public description?: string;

  // Associations will be defined in index.ts
}

QuotationItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quotationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quotations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'QuotationItem',
    tableName: 'quotation_items',
    timestamps: false,
    indexes: [
      { fields: ['quotationId'] },
      { fields: ['productId'] },
    ],
  }
);

export { QuotationItem };