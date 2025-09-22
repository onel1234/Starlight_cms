import { useMemo } from 'react'
import { CheckIcon, XIcon } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
}

interface PasswordCriteria {
  label: string
  test: (password: string) => boolean
}

const PASSWORD_CRITERIA: PasswordCriteria[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8
  },
  {
    label: 'Contains uppercase letter',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: 'Contains lowercase letter',
    test: (password) => /[a-z]/.test(password)
  },
  {
    label: 'Contains number',
    test: (password) => /\d/.test(password)
  },
  {
    label: 'Contains special character',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
]

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { strength, score, criteriaMet } = useMemo(() => {
    const criteriaMet = PASSWORD_CRITERIA.map(criteria => ({
      ...criteria,
      met: criteria.test(password)
    }))
    
    const score = criteriaMet.filter(criteria => criteria.met).length
    
    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
    if (score >= 4) strength = 'strong'
    else if (score >= 3) strength = 'good'
    else if (score >= 2) strength = 'fair'
    
    return { strength, score, criteriaMet }
  }, [password])

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak': return 'bg-red-500'
      case 'fair': return 'bg-yellow-500'
      case 'good': return 'bg-blue-500'
      case 'strong': return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }

  const getStrengthText = () => {
    switch (strength) {
      case 'weak': return 'Weak'
      case 'fair': return 'Fair'
      case 'good': return 'Good'
      case 'strong': return 'Strong'
      default: return ''
    }
  }

  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(score / PASSWORD_CRITERIA.length) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${
          strength === 'weak' ? 'text-red-600' :
          strength === 'fair' ? 'text-yellow-600' :
          strength === 'good' ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {getStrengthText()}
        </span>
      </div>

      {/* Criteria checklist */}
      <div className="space-y-1">
        {criteriaMet.map((criteria, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
              criteria.met ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {criteria.met ? (
                <CheckIcon className="w-3 h-3" />
              ) : (
                <XIcon className="w-3 h-3" />
              )}
            </div>
            <span className={criteria.met ? 'text-green-600' : 'text-gray-500'}>
              {criteria.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}