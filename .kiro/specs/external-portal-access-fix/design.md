# Design Document

## Overview

This design addresses the access issues that customers and suppliers are experiencing when logging into their dashboards. The analysis reveals that while the basic authentication and routing infrastructure exists, there are several gaps in error handling, user feedback, session management, and access control validation that need to be addressed.

The current system has:
- Basic role-based routing with ProtectedRoute components
- Mock authentication service with test users
- External portal layouts and components
- Basic error handling in individual components

However, it lacks:
- Comprehensive error handling and user feedback
- Proper session validation and recovery
- Clear access denied messaging with actionable guidance
- Robust authentication state management for external users
- Proper redirect handling after authentication

## Architecture

### Current Architecture Analysis

The system uses a layered architecture:
1. **Authentication Layer**: AuthContext with useAuth hook
2. **Routing Layer**: React Router with ProtectedRoute wrapper
3. **Service Layer**: Mock services for external portal data
4. **Component Layer**: Portal-specific components for customers and suppliers

### Enhanced Architecture Components

#### 1. Enhanced Authentication Flow
- Improved error handling in AuthContext
- Better session validation and recovery
- Role-specific redirect logic
- Authentication state persistence validation

#### 2. Access Control Enhancement
- Enhanced ProtectedRoute with better error messaging
- Role validation middleware
- Session timeout handling
- Security event logging

#### 3. Error Handling System
- Centralized error boundary for external portals
- User-friendly error messages with recovery actions
- Network error detection and retry mechanisms
- Support contact integration

#### 4. Session Management
- Enhanced session validation
- Automatic session extension prompts
- Graceful session expiry handling
- Cross-tab session synchronization

## Components and Interfaces

### 1. Enhanced AuthContext

**Purpose**: Improve authentication state management and error handling

**Key Enhancements**:
- Better error categorization (network, credentials, account status)
- Role-specific authentication validation
- Enhanced session recovery mechanisms
- Improved redirect logic for external users

**Interface**:
```typescript
interface EnhancedAuthContextType extends AuthContextType {
  authError: AuthError | null
  clearAuthError: () => void
  validateSession: () => Promise<boolean>
  getRedirectPath: (role: UserRole) => string
}

interface AuthError {
  type: 'credentials' | 'network' | 'account' | 'session' | 'permission'
  message: string
  details?: string
  recoveryActions?: RecoveryAction[]
}
```

### 2. Enhanced ProtectedRoute Component

**Purpose**: Provide better access control with user-friendly error messages

**Key Features**:
- Role-specific error messages
- Recovery action suggestions
- Support contact information
- Proper loading states

**Interface**:
```typescript
interface EnhancedProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  fallbackComponent?: React.ComponentType<{ error: AccessError }>
}
```

### 3. External Portal Error Boundary

**Purpose**: Catch and handle errors specific to external portal operations

**Key Features**:
- Portal-specific error handling
- Data loading error recovery
- Network error retry mechanisms
- User-friendly error displays

### 4. Session Management Service

**Purpose**: Handle session validation, extension, and expiry

**Key Features**:
- Automatic session validation
- Session extension prompts
- Cross-tab session synchronization
- Graceful logout handling

### 5. Enhanced External Layout

**Purpose**: Provide consistent error handling and user feedback across external portals

**Key Features**:
- Global error state management
- Session status indicators
- Support contact integration
- Consistent navigation error handling

## Data Models

### Enhanced User Authentication State

```typescript
interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  sessionExpiry: number | null
  authError: AuthError | null
  lastValidation: number | null
}
```

### Error Tracking

```typescript
interface AccessError {
  type: 'authentication' | 'authorization' | 'network' | 'data'
  code: string
  message: string
  userMessage: string
  recoveryActions: RecoveryAction[]
  timestamp: Date
}

interface RecoveryAction {
  label: string
  action: 'retry' | 'login' | 'contact' | 'navigate'
  target?: string
}
```

### Session Validation

```typescript
interface SessionValidation {
  isValid: boolean
  expiresAt: number
  warningThreshold: number
  canExtend: boolean
  errors?: string[]
}
```

## Error Handling

### 1. Authentication Errors

**Categories**:
- Invalid credentials
- Account inactive/suspended
- Network connectivity issues
- Session expired
- Role validation failures

**Handling Strategy**:
- Clear, actionable error messages
- Automatic retry for network issues
- Redirect to appropriate recovery flows
- Support contact information

### 2. Authorization Errors

**Categories**:
- Insufficient permissions
- Role mismatch
- Route access denied
- Data access restrictions

**Handling Strategy**:
- Role-specific error messages
- Suggested alternative actions
- Clear explanation of required permissions
- Contact information for access requests

### 3. Data Loading Errors

**Categories**:
- Service unavailable
- Data not found
- Network timeouts
- Invalid responses

**Handling Strategy**:
- Retry mechanisms with exponential backoff
- Fallback content when appropriate
- Clear loading states
- Manual retry options

### 4. Session Management Errors

**Categories**:
- Session expired
- Invalid session token
- Cross-tab conflicts
- Session validation failures

**Handling Strategy**:
- Automatic session refresh attempts
- Clear expiry warnings
- Graceful logout with state preservation
- Re-authentication prompts

## Testing Strategy

### 1. Authentication Flow Testing

**Test Cases**:
- Valid customer login and redirect
- Valid supplier login and redirect
- Invalid credentials handling
- Account status validation
- Session expiry scenarios
- Network error scenarios

### 2. Access Control Testing

**Test Cases**:
- Role-based route access validation
- Cross-role access attempts
- Session validation on route changes
- Protected route error handling
- Redirect logic validation

### 3. Error Handling Testing

**Test Cases**:
- Network connectivity issues
- Service unavailability
- Invalid session scenarios
- Data loading failures
- User-friendly error message display

### 4. Session Management Testing

**Test Cases**:
- Session expiry warnings
- Automatic session extension
- Cross-tab session synchronization
- Session validation on app focus
- Graceful logout scenarios

### 5. User Experience Testing

**Test Cases**:
- Error message clarity and actionability
- Recovery action effectiveness
- Loading state consistency
- Support contact accessibility
- Mobile responsiveness of error states

### 6. Integration Testing

**Test Cases**:
- End-to-end customer portal access
- End-to-end supplier portal access
- Cross-portal navigation restrictions
- Authentication state persistence
- Error boundary effectiveness

## Implementation Approach

### Phase 1: Authentication Enhancement
- Enhance AuthContext with better error handling
- Improve login flow with role-specific redirects
- Add session validation mechanisms
- Implement authentication error categorization

### Phase 2: Access Control Improvement
- Enhance ProtectedRoute component
- Add role-specific error messages
- Implement recovery action suggestions
- Add support contact integration

### Phase 3: Error Handling System
- Create external portal error boundary
- Implement centralized error handling
- Add retry mechanisms for network errors
- Create user-friendly error displays

### Phase 4: Session Management
- Enhance session validation
- Add session extension prompts
- Implement cross-tab synchronization
- Add graceful session expiry handling

### Phase 5: User Experience Polish
- Improve loading states
- Add consistent error messaging
- Implement support contact integration
- Add accessibility improvements

## Security Considerations

### 1. Session Security
- Secure session token storage
- Automatic session cleanup on logout
- Session validation on sensitive operations
- Cross-tab session management

### 2. Access Control
- Role validation on every route change
- Permission checking for data access
- Security event logging
- Graceful handling of permission changes

### 3. Error Information
- Avoid exposing sensitive system information
- Sanitize error messages for external users
- Log security events for monitoring
- Provide generic error messages for security issues

### 4. Authentication State
- Secure storage of authentication data
- Automatic cleanup of expired sessions
- Protection against session hijacking
- Validation of authentication tokens