import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
}

const paddingClasses = {
  none: '',
  sm: 'px-4 sm:px-6',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 sm:px-8 lg:px-12'
}

export function ResponsiveContainer({ 
  children, 
  className = '', 
  maxWidth = '7xl',
  padding = 'md'
}: ResponsiveContainerProps) {
  return (
    <div className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg'
}

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8'
}

export function ResponsiveGrid({ 
  children, 
  className = '', 
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gridCols = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  ].filter(Boolean).join(' ')

  return (
    <div className={`grid ${gridCols} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
}

interface ResponsiveStackProps {
  children: ReactNode
  className?: string
  direction?: 'vertical' | 'horizontal' | 'responsive'
  spacing?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
}

const spacingClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6'
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
}

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around'
}

export function ResponsiveStack({ 
  children, 
  className = '', 
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start'
}: ResponsiveStackProps) {
  const directionClasses = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-row',
    responsive: 'flex flex-col sm:flex-row'
  }

  return (
    <div className={`
      ${directionClasses[direction]} 
      ${spacingClasses[spacing]} 
      ${alignClasses[align]} 
      ${justifyClasses[justify]} 
      ${className}
    `}>
      {children}
    </div>
  )
}

// Responsive text component
interface ResponsiveTextProps {
  children: ReactNode
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success' | 'warning'
  className?: string
}

const sizeClasses = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  base: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
  xl: 'text-xl sm:text-2xl',
  '2xl': 'text-2xl sm:text-3xl',
  '3xl': 'text-3xl sm:text-4xl'
}

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
}

const colorClasses = {
  primary: 'text-primary-600',
  secondary: 'text-black',
  muted: 'text-secondary-600',
  error: 'text-red-600',
  success: 'text-green-600',
  warning: 'text-yellow-600'
}

export function ResponsiveText({ 
  children, 
  size = 'base',
  weight = 'normal',
  color = 'secondary',
  className = ''
}: ResponsiveTextProps) {
  return (
    <span className={`
      ${sizeClasses[size]} 
      ${weightClasses[weight]} 
      ${colorClasses[color]} 
      ${className}
    `}>
      {children}
    </span>
  )
}