import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockInventoryService } from '../services/mockInventoryService'
import { 
  CreateProductData,
  UpdateProductData,
  CreateSupplierData,
  UpdateSupplierData
} from '../types/inventory'

// Product hooks
export const useProducts = (filters?: {
  search?: string
  categoryId?: number
  supplierId?: number
  status?: 'Active' | 'Inactive'
  lowStock?: boolean
}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => mockInventoryService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => mockInventoryService.getProduct(id),
    enabled: !!id,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateProductData) => mockInventoryService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductData }) => 
      mockInventoryService.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => mockInventoryService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

// Category hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => mockInventoryService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => mockInventoryService.getCategory(id),
    enabled: !!id,
  })
}

// Supplier hooks
export const useSuppliers = (filters?: {
  search?: string
  status?: 'Active' | 'Inactive'
}) => {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => mockInventoryService.getSuppliers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSupplier = (id: number) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => mockInventoryService.getSupplier(id),
    enabled: !!id,
  })
}

export const useCreateSupplier = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateSupplierData) => mockInventoryService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierData }) => 
      mockInventoryService.updateSupplier(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['supplier', id] })
    },
  })
}

// Stock movement hooks
export const useStockMovements = (productId?: number) => {
  return useQuery({
    queryKey: ['stock-movements', productId],
    queryFn: () => mockInventoryService.getStockMovements(productId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      productId: number
      movementType: 'IN' | 'OUT' | 'ADJUSTMENT'
      quantity: number
      reason?: string
      referenceId?: number
      referenceType?: string
    }) => mockInventoryService.createStockMovement(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] })
    },
  })
}

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => mockInventoryService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export const useLowStockProducts = () => {
  return useQuery({
    queryKey: ['low-stock-products'],
    queryFn: () => mockInventoryService.getLowStockProducts(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}