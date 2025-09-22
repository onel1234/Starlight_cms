import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { UserIcon, CameraIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { UserProfile, User } from '../../types/auth'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

interface ProfileFormData {
  profile: UserProfile
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    setError: setProfileError
  } = useForm<ProfileFormData>({
    defaultValues: {
      profile: user?.profile || {
        userId: user?.id || 0,
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        companyName: '',
        position: '',
        avatarUrl: ''
      }
    }
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    setError: setPasswordError,
    reset: resetPasswordForm
  } = useForm<PasswordChangeData>()

  const newPassword = watchPassword('newPassword', '')

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      // TODO: Implement actual profile update API call
      console.log('Profile update data:', data)
      // const updatedUser = await userService.updateProfile(data.profile)
      
      // Mock update for now
      const updatedUser: User = {
        ...user,
        profile: data.profile
      }
      
      updateUser(updatedUser)
      
      // Show success message
      // toast.success('Profile updated successfully')
    } catch (error) {
      setProfileError('root', {
        message: 'Failed to update profile. Please try again.'
      })
    }
  }

  const onPasswordSubmit = async (data: PasswordChangeData) => {
    try {
      // TODO: Implement actual password change API call
      console.log('Password change data:', data)
      // await authService.changePassword(data)
      
      resetPasswordForm()
      setIsEditingPassword(false)
      
      // Show success message
      // toast.success('Password changed successfully')
    } catch (error) {
      setPasswordError('root', {
        message: 'Failed to change password. Please check your current password.'
      })
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // TODO: Implement actual file upload
      console.log('Uploading avatar:', file)
      // const avatarUrl = await fileService.uploadAvatar(file)
      
      // Mock avatar URL for now
      const avatarUrl = URL.createObjectURL(file)
      
      const updatedUser: User = {
        ...user,
        profile: {
          ...user.profile!,
          avatarUrl
        }
      }
      
      updateUser(updatedUser)
    } catch (error) {
      console.error('Avatar upload failed:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Profile Settings</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Profile Picture</h2>
              
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary-100 flex items-center justify-center">
                    {user.profile?.avatarUrl ? (
                      <img
                        src={user.profile.avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-16 h-16 text-secondary-400" />
                    )}
                  </div>
                  
                  <label className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors">
                    <CameraIcon className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-secondary-900">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </p>
                  <p className="text-sm text-secondary-500">{user.role}</p>
                  <p className="text-sm text-secondary-500">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Personal Information</h2>
              
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700">
                      First Name *
                    </label>
                    <input
                      {...registerProfile('profile.firstName', {
                        required: 'First name is required',
                        minLength: { value: 2, message: 'First name must be at least 2 characters' }
                      })}
                      type="text"
                      className="mt-1 input-field"
                    />
                    {profileErrors.profile?.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileErrors.profile.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700">
                      Last Name *
                    </label>
                    <input
                      {...registerProfile('profile.lastName', {
                        required: 'Last name is required',
                        minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                      })}
                      type="text"
                      className="mt-1 input-field"
                    />
                    {profileErrors.profile?.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileErrors.profile.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700">
                      Phone Number
                    </label>
                    <input
                      {...registerProfile('profile.phone', {
                        pattern: {
                          value: /^[\+]?[1-9][\d]{0,15}$/,
                          message: 'Please enter a valid phone number'
                        }
                      })}
                      type="tel"
                      className="mt-1 input-field"
                    />
                    {profileErrors.profile?.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileErrors.profile.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700">
                      Position
                    </label>
                    <input
                      {...registerProfile('profile.position')}
                      type="text"
                      className="mt-1 input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700">
                    Company Name
                  </label>
                  <input
                    {...registerProfile('profile.companyName')}
                    type="text"
                    className="mt-1 input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700">
                    Address
                  </label>
                  <textarea
                    {...registerProfile('profile.address')}
                    rows={3}
                    className="mt-1 input-field"
                  />
                </div>

                {profileErrors.root && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{profileErrors.root.message}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isProfileSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProfileSubmitting ? (
                      <LoadingSpinner size="sm" className="text-white" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-secondary-900">Password</h2>
            {!isEditingPassword && (
              <button
                onClick={() => setIsEditingPassword(true)}
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Change Password
              </button>
            )}
          </div>

          {isEditingPassword ? (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700">
                  Current Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required'
                    })}
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-secondary-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-secondary-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700">
                    New Password *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        }
                      })}
                      type={showNewPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOffIcon className="h-5 w-5 text-secondary-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-secondary-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700">
                    Confirm New Password *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: (value) => value === newPassword || 'Passwords do not match'
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-5 w-5 text-secondary-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-secondary-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {passwordErrors.root && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{passwordErrors.root.message}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPassword(false)
                    resetPasswordForm()
                  }}
                  className="inline-flex justify-center py-2 px-4 border border-secondary-300 shadow-sm text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPasswordSubmitting ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-secondary-600">
              Password was last changed on {new Date().toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}