import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CreateTenderData, Tender } from '../../types/tender'
import { useCreateTender, useUpdateTender } from '../../hooks/useTenders'

interface TenderFormProps {
  tender?: Tender
  onClose: () => void
}

export const TenderForm: React.FC<TenderFormProps> = ({ tender, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createTender = useCreateTender()
  const updateTender = useUpdateTender()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<CreateTenderData>({
    defaultValues: tender ? {
      title: tender.title,
      description: tender.description,
      requirements: tender.requirements || '',
      submissionDeadline: new Date(tender.submissionDeadline).toISOString().slice(0, 16)
    } : {
      submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) // 30 days from now
    }
  })

  const onSubmit = async (data: CreateTenderData) => {
    setIsSubmitting(true)
    try {
      const formattedData = {
        ...data,
        submissionDeadline: new Date(data.submissionDeadline)
      }

      if (tender) {
        await updateTender.mutateAsync({ id: tender.id, data: formattedData })
      } else {
        await createTender.mutateAsync(formattedData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving tender:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {tender ? 'Edit Tender' : 'Create New Tender'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tender Title *
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tender title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description', { required: 'Description is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the tender requirements and scope"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                Technical Requirements
              </label>
              <textarea
                id="requirements"
                rows={6}
                {...register('requirements')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List specific technical requirements, certifications, experience needed..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Specify minimum experience, certifications, technical capabilities, etc.
              </p>
            </div>

            <div>
              <label htmlFor="submissionDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                Submission Deadline *
              </label>
              <input
                type="datetime-local"
                id="submissionDeadline"
                {...register('submissionDeadline', { required: 'Submission deadline is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.submissionDeadline && (
                <p className="mt-1 text-sm text-red-600">{errors.submissionDeadline.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : tender ? 'Update Tender' : 'Create Tender'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}