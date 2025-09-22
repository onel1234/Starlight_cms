import { formatCurrency } from '../../utils/formatters'

interface BudgetProgressProps {
  budget: number
  actualCost: number
  className?: string
}

export function BudgetProgress({ budget, actualCost, className = '' }: BudgetProgressProps) {
  const percentage = budget > 0 ? Math.min((actualCost / budget) * 100, 100) : 0
  const isOverBudget = actualCost > budget
  const remaining = budget - actualCost

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500'
    if (percentage > 80) return 'bg-yellow-500'
    if (percentage > 60) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getBackgroundColor = () => {
    if (isOverBudget) return 'bg-red-100'
    if (percentage > 80) return 'bg-yellow-100'
    if (percentage > 60) return 'bg-orange-100'
    return 'bg-green-100'
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-secondary-700">Budget Progress</span>
        <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-secondary-900'}`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      
      <div className={`w-full bg-secondary-200 rounded-full h-2 ${getBackgroundColor()}`}>
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-secondary-600">
        <span>Spent: {formatCurrency(actualCost)}</span>
        <span>Budget: {formatCurrency(budget)}</span>
      </div>
      
      {isOverBudget ? (
        <div className="text-xs text-red-600 font-medium">
          Over budget by {formatCurrency(actualCost - budget)}
        </div>
      ) : (
        <div className="text-xs text-secondary-600">
          Remaining: {formatCurrency(remaining)}
        </div>
      )}
    </div>
  )
}