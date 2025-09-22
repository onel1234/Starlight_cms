import Joi from 'joi'

// Common validation schemas
export const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .required()
  .messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  })

export const passwordSchema = Joi.string()
  .min(6)
  .required()
  .messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  })

export const phoneSchema = Joi.string()
  .pattern(/^[\+]?[1-9][\d]{0,15}$/)
  .messages({
    'string.pattern.base': 'Please enter a valid phone number',
  })

// User validation schemas
export const loginSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password',
    }),
  role: Joi.string()
    .valid('Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 
           'Customer Success Manager', 'Employee', 'Customer', 'Supplier')
    .required(),
  profile: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: phoneSchema.optional(),
    address: Joi.string().max(500).optional(),
    companyName: Joi.string().max(255).optional(),
    position: Joi.string().max(100).optional(),
  }).required(),
})

// Project validation schemas
export const projectSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000).optional(),
  clientId: Joi.number().integer().positive().optional(),
  projectManagerId: Joi.number().integer().positive().optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  budget: Joi.number().positive().required(),
  location: Joi.string().max(500).optional(),
  projectType: Joi.string().max(100).optional(),
})

// Task validation schemas
export const taskSchema = Joi.object({
  projectId: Joi.number().integer().positive().required(),
  assignedTo: Joi.number().integer().positive().optional(),
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000).optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').required(),
  startDate: Joi.date().optional(),
  dueDate: Joi.date().when('startDate', {
    is: Joi.exist(),
    then: Joi.date().greater(Joi.ref('startDate')),
    otherwise: Joi.date(),
  }).optional(),
  estimatedHours: Joi.number().positive().optional(),
})

// Product validation schemas
export const productSchema = Joi.object({
  categoryId: Joi.number().integer().positive().optional(),
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().max(1000).optional(),
  sku: Joi.string().max(100).optional(),
  unitPrice: Joi.number().positive().required(),
  stockQuantity: Joi.number().integer().min(0).required(),
  minimumStock: Joi.number().integer().min(0).required(),
  unitOfMeasure: Joi.string().max(50).optional(),
  supplierId: Joi.number().integer().positive().optional(),
})

// Supplier validation schemas
export const supplierSchema = Joi.object({
  companyName: Joi.string().min(2).max(255).required(),
  contactPerson: Joi.string().max(255).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: Joi.string().max(500).optional(),
  taxNumber: Joi.string().max(50).optional(),
  paymentTerms: Joi.string().max(100).optional(),
})

// Quotation validation schemas
export const quotationSchema = Joi.object({
  customerId: Joi.number().integer().positive().required(),
  projectId: Joi.number().integer().positive().optional(),
  validUntil: Joi.date().greater('now').optional(),
  notes: Joi.string().max(1000).optional(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().positive().required(),
      quantity: Joi.number().positive().required(),
      unitPrice: Joi.number().positive().required(),
      description: Joi.string().max(500).optional(),
    })
  ).min(1).required(),
})

// Helper function to validate data against schema
export function validateData<T>(data: T, schema: Joi.ObjectSchema): { error?: string; value?: T } {
  const { error, value } = schema.validate(data, { abortEarly: false })
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ')
    return { error: errorMessage }
  }
  
  return { value }
}

// Helper function to get field-specific errors
export function getFieldErrors(error: Joi.ValidationError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  
  error.details.forEach(detail => {
    const fieldName = detail.path.join('.')
    fieldErrors[fieldName] = detail.message
  })
  
  return fieldErrors
}