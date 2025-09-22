import { User } from '../types/auth'

// Mock user database with customers and suppliers
export const mockUsers: User[] = [
  // Internal Staff Users
  {
    id: 1,
    email: 'director@starlightconstructions.com',
    role: 'Director',
    status: 'Active',
    emailVerified: true,
    profile: {
      userId: 1,
      firstName: 'John',
      lastName: 'Smith',
      position: 'Director',
      phone: '+1-555-0001'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    email: 'pm@starlightconstructions.com',
    role: 'Project Manager',
    status: 'Active',
    emailVerified: true,
    profile: {
      userId: 2,
      firstName: 'Sarah',
      lastName: 'Johnson',
      position: 'Senior Project Manager',
      phone: '+1-555-0002'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  // Customer Users
  {
    id: 101,
    email: 'customer1@example.com',
    role: 'Customer',
    status: 'Active',
    emailVerified: true,
    profile: {
      userId: 101,
      firstName: 'Michael',
      lastName: 'Anderson',
      position: 'CEO',
      phone: '+1-555-1001',
      companyName: 'Anderson Industries',
      address: '123 Business Ave, City Center, NY 10001'
    },
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: 102,
    email: 'customer2@example.com',
    role: 'Customer',
    status: 'Active',
    emailVerified: true,
    profile: {
      userId: 102,
      firstName: 'Emily',
      lastName: 'Rodriguez',
      position: 'Operations Manager',
      phone: '+1-555-1002',
      companyName: 'Rodriguez Manufacturing Co.',
      address: '456 Industrial Blvd, Manufacturing District, CA 90210'
    },
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: 103,
    email: 'customer3@example.com',
    role: 'Customer',
    status: 'Active',
    emailVerified: true,
    profile: {
      userId: 103,
      firstName: 'David',
      lastName: 'Chen',
      position: 'Facility Manager',
      phone: '+1-555-1003',
      companyName: 'Chen Water Solutions',
      address: '789 Water Treatment Way, Industrial Park, TX 75001'
    },
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  },

  // Supplier Users
  {
    id: 201,
    email: 'supplier1@example.com',
    role: 'Supplier',
    status: 'Active',
    emailVerified: true,
    profile: {
      userId: 201,
      firstName: 'Robert',
      lastName: 'Thompson',
      position: 'Sales Manager',
      phone: '+1-555-2001',
      companyName: 'Thompson Equipment Supply',
      address: '321 Equipment Row, Supplier District, FL 33101'
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 202,
    email: 'supplier2@example.com',
    role: 'Supplier',
    status: 'Active',
    emailVerified: true,
    profile: {
      userId: 202,
      firstName: 'Lisa',
      lastName: 'Martinez',
      position: 'Business Development',
      phone: '+1-555-2002',
      companyName: 'Martinez Steel & Materials',
      address: '654 Steel Mill Drive, Industrial Zone, OH 44101'
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 203,
    email: 'supplier3@example.com',
    role: 'Supplier',
    status: 'Active',
    emailVerified: true,
    profile: {
      userId: 203,
      firstName: 'James',
      lastName: 'Wilson',
      position: 'Account Manager',
      phone: '+1-555-2003',
      companyName: 'Wilson Concrete Solutions',
      address: '987 Concrete Plant Rd, Construction Hub, WA 98101'
    },
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10')
  },
  {
    id: 204,
    email: 'supplier4@example.com',
    role: 'Supplier',
    status: 'Active',
    emailVerified: true,
    profile: {
      userId: 204,
      firstName: 'Amanda',
      lastName: 'Davis',
      position: 'Regional Sales Director',
      phone: '+1-555-2004',
      companyName: 'Davis Filtration Systems',
      address: '147 Filter Tech Blvd, Tech Park, MA 02101'
    },
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  }
]

// Helper function to find user by email
export const findUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase())
}

// Helper function to get users by role
export const getUsersByRole = (role: string): User[] => {
  return mockUsers.filter(user => user.role === role)
}

// Test credentials for easy login
export const testCredentials = {
  // Internal Staff
  director: { email: 'director@starlightconstructions.com', password: 'password123' },
  projectManager: { email: 'pm@starlightconstructions.com', password: 'password123' },
  
  // Customers
  customer1: { email: 'customer1@example.com', password: 'password123' },
  customer2: { email: 'customer2@example.com', password: 'password123' },
  customer3: { email: 'customer3@example.com', password: 'password123' },
  
  // Suppliers
  supplier1: { email: 'supplier1@example.com', password: 'password123' },
  supplier2: { email: 'supplier2@example.com', password: 'password123' },
  supplier3: { email: 'supplier3@example.com', password: 'password123' },
  supplier4: { email: 'supplier4@example.com', password: 'password123' }
}