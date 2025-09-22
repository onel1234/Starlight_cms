export interface Category {
  id: number
  name: string
  description?: string
  parentId?: number
  createdAt: Date
  parent?: Category
  children?: Category[]
}

export interface Supplier {
  id: number
  companyName: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  taxNumber?: string
  paymentTerms?: string
  rating: number
  status: 'Active' | 'Inactive'
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: number
  categoryId?: number
  name: string
  description?: string
  sku?: string
  unitPrice: number
  stockQuantity: number
  minimumStock: number
  unitOfMeasure?: string
  supplierId?: number
  imageUrls?: string[]
  specifications?: Record<string, any>
  status: 'Active' | 'Inactive'
  createdAt: Date
  updatedAt: Date
  category?: Category
  supplier?: Supplier
}

export interface StockMovement {
  id: number
  productId: number
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reason?: string
  referenceId?: number
  referenceType?: string
  createdBy: number
  createdAt: Date
  product?: Product
}

export interface CreateProductData {
  categoryId?: number
  name: string
  description?: string
  sku?: string
  unitPrice: number
  stockQuantity: number
  minimumStock: number
  unitOfMeasure?: string
  supplierId?: number
  imageUrls?: string[]
  specifications?: Record<string, any>
}

export interface UpdateProductData extends Partial<CreateProductData> {
  status?: 'Active' | 'Inactive'
}

export interface CreateSupplierData {
  companyName: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  taxNumber?: string
  paymentTerms?: string
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  rating?: number
  status?: 'Active' | 'Inactive'
}