import { 
  Product, 
  Category, 
  Supplier, 
  StockMovement, 
  CreateProductData, 
  UpdateProductData,
  CreateSupplierData,
  UpdateSupplierData 
} from '../types/inventory'
import { 
  mockProducts, 
  mockCategories, 
  mockSuppliers, 
  mockStockMovements
} from '../data/mockInventory'

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export class MockInventoryService {
  private products: Product[] = [...mockProducts]
  private categories: Category[] = [...mockCategories]
  private suppliers: Supplier[] = [...mockSuppliers]
  private stockMovements: StockMovement[] = [...mockStockMovements]

  // Product methods
  async getProducts(filters?: {
    search?: string
    categoryId?: number
    supplierId?: number
    status?: 'Active' | 'Inactive'
    lowStock?: boolean
  }): Promise<Product[]> {
    await delay(300)
    
    let filteredProducts = [...this.products]

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.sku?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.categoryId) {
      filteredProducts = filteredProducts.filter(product => 
        product.categoryId === filters.categoryId
      )
    }

    if (filters?.supplierId) {
      filteredProducts = filteredProducts.filter(product => 
        product.supplierId === filters.supplierId
      )
    }

    if (filters?.status) {
      filteredProducts = filteredProducts.filter(product => 
        product.status === filters.status
      )
    }

    if (filters?.lowStock) {
      filteredProducts = filteredProducts.filter(product => 
        product.stockQuantity <= product.minimumStock
      )
    }

    // Add related data
    return filteredProducts.map(product => ({
      ...product,
      category: this.categories.find(cat => cat.id === product.categoryId),
      supplier: this.suppliers.find(sup => sup.id === product.supplierId)
    }))
  }

  async getProduct(id: number): Promise<Product | null> {
    await delay(200)
    const product = this.products.find(p => p.id === id)
    if (!product) return null

    return {
      ...product,
      category: this.categories.find(cat => cat.id === product.categoryId),
      supplier: this.suppliers.find(sup => sup.id === product.supplierId)
    }
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    await delay(500)
    const newProduct: Product = {
      id: Math.max(...this.products.map(p => p.id)) + 1,
      ...data,
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.products.push(newProduct)
    return newProduct
  }

  async updateProduct(id: number, data: UpdateProductData): Promise<Product> {
    await delay(400)
    const index = this.products.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Product not found')

    this.products[index] = {
      ...this.products[index],
      ...data,
      updatedAt: new Date()
    }
    return this.products[index]
  }

  async deleteProduct(id: number): Promise<void> {
    await delay(300)
    const index = this.products.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Product not found')
    this.products.splice(index, 1)
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    await delay(200)
    return this.categories.map(category => ({
      ...category,
      parent: category.parentId ? this.categories.find(c => c.id === category.parentId) : undefined,
      children: this.categories.filter(c => c.parentId === category.id)
    }))
  }

  async getCategory(id: number): Promise<Category | null> {
    await delay(150)
    const category = this.categories.find(c => c.id === id)
    if (!category) return null

    return {
      ...category,
      parent: category.parentId ? this.categories.find(c => c.id === category.parentId) : undefined,
      children: this.categories.filter(c => c.parentId === category.id)
    }
  }

  // Supplier methods
  async getSuppliers(filters?: {
    search?: string
    status?: 'Active' | 'Inactive'
  }): Promise<Supplier[]> {
    await delay(250)
    
    let filteredSuppliers = [...this.suppliers]

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filteredSuppliers = filteredSuppliers.filter(supplier =>
        supplier.companyName.toLowerCase().includes(searchLower) ||
        supplier.contactPerson?.toLowerCase().includes(searchLower) ||
        supplier.email?.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.status) {
      filteredSuppliers = filteredSuppliers.filter(supplier => 
        supplier.status === filters.status
      )
    }

    return filteredSuppliers
  }

  async getSupplier(id: number): Promise<Supplier | null> {
    await delay(200)
    return this.suppliers.find(s => s.id === id) || null
  }

  async createSupplier(data: CreateSupplierData): Promise<Supplier> {
    await delay(500)
    const newSupplier: Supplier = {
      id: Math.max(...this.suppliers.map(s => s.id)) + 1,
      ...data,
      rating: 0,
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.suppliers.push(newSupplier)
    return newSupplier
  }

  async updateSupplier(id: number, data: UpdateSupplierData): Promise<Supplier> {
    await delay(400)
    const index = this.suppliers.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Supplier not found')

    this.suppliers[index] = {
      ...this.suppliers[index],
      ...data,
      updatedAt: new Date()
    }
    return this.suppliers[index]
  }

  // Stock movement methods
  async getStockMovements(productId?: number): Promise<StockMovement[]> {
    await delay(300)
    
    let movements = [...this.stockMovements]
    
    if (productId) {
      movements = movements.filter(movement => movement.productId === productId)
    }

    // Add product data
    return movements.map(movement => ({
      ...movement,
      product: this.products.find(p => p.id === movement.productId)
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async createStockMovement(data: {
    productId: number
    movementType: 'IN' | 'OUT' | 'ADJUSTMENT'
    quantity: number
    reason?: string
    referenceId?: number
    referenceType?: string
  }): Promise<StockMovement> {
    await delay(400)
    
    const newMovement: StockMovement = {
      id: Math.max(...this.stockMovements.map(m => m.id)) + 1,
      ...data,
      createdBy: 1, // Mock current user
      createdAt: new Date()
    }
    
    this.stockMovements.push(newMovement)
    
    // Update product stock quantity
    const productIndex = this.products.findIndex(p => p.id === data.productId)
    if (productIndex !== -1) {
      this.products[productIndex].stockQuantity += data.quantity
      this.products[productIndex].updatedAt = new Date()
    }
    
    return newMovement
  }

  // Dashboard methods
  async getDashboardStats(): Promise<{
    totalProducts: number
    lowStockCount: number
    totalValue: number
    activeSuppliers: number
    recentMovements: StockMovement[]
  }> {
    await delay(400)
    
    const lowStockProducts = this.products.filter(p => p.stockQuantity <= p.minimumStock)
    const totalValue = this.products.reduce((sum, product) => 
      sum + (product.stockQuantity * product.unitPrice), 0
    )
    const activeSuppliers = this.suppliers.filter(s => s.status === 'Active').length
    const recentMovements = this.stockMovements
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(movement => ({
        ...movement,
        product: this.products.find(p => p.id === movement.productId)
      }))

    return {
      totalProducts: this.products.length,
      lowStockCount: lowStockProducts.length,
      totalValue,
      activeSuppliers,
      recentMovements
    }
  }

  async getLowStockProducts(): Promise<Product[]> {
    await delay(200)
    return this.products
      .filter(product => product.stockQuantity <= product.minimumStock)
      .map(product => ({
        ...product,
        category: this.categories.find(cat => cat.id === product.categoryId),
        supplier: this.suppliers.find(sup => sup.id === product.supplierId)
      }))
  }
}

export const mockInventoryService = new MockInventoryService()