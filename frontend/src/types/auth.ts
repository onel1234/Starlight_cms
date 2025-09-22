export type UserRole = 
  | 'Director' 
  | 'Project Manager' 
  | 'Quantity Surveyor' 
  | 'Sales Manager' 
  | 'Customer Success Manager' 
  | 'Employee' 
  | 'Customer' 
  | 'Supplier'

export type UserStatus = 'Active' | 'Inactive' | 'Pending'

export interface UserProfile {
  userId: number
  firstName: string
  lastName: string
  phone?: string
  address?: string
  companyName?: string
  position?: string
  avatarUrl?: string
}

export interface User {
  id: number
  email: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  profile?: UserProfile
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  role: UserRole
  profile: Omit<UserProfile, 'userId'>
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}