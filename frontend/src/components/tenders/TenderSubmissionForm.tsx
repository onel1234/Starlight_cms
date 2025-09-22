import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Tender, CreateTenderSubmissionData } from '../../types/tender'
import { useCreateTenderSubmission } from '../../hooks/useTenders'
import { formatCurrency } from '../../utils/formatters'

interface TenderSubmissionFormProps {
  tender: Tender
  onClose: () => void
}

interface FormData {
  proposedAmount: string
  notes: string
}

export const TenderSubmissionForm: React.FC<TenderSubmissionFormProps> = ({
  tender,
  onClose
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const createSubmission = useCreateTenderSubmission()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>()

  const proposedAmount = watch('proposedAmount')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a supported file type`)
        return false
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large (max 10MB)`)
        return false
      }
      
      return true
    })
    
    setUploadedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const submissionData: CreateTenderSubmissionData = {
        tenderId: tender.id,
        proposedAmount: parseFloat(data.proposedAmount),
        notes: data.notes || undefined
      }

      await createSubmission.mutateAsync(submissionData)
      onClose()
    } catch (error) {
      console.error('Error submitting proposal:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const daysUntilDeadline = Math.ceil(
    (new Date(tender.submissionDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Submit Proposal</h2>
              <p className="text-gray-600">{tender.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Deadline Warning */}
          <div className={`p-4 rounded-lg mb-6 ${
            daysUntilDeadline <= 3 
              ? 'bg-red-50 border border-red-200' 
              : daysUntilDeadline <= 7 
                ? 'bg-orange-50 border border-orange-200'
                : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${
                daysUntilDeadline <= 3 ? 'text-red-600' : daysUntilDeadline <= 7 ? 'text-orange-600' : 'text-blue-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-medium ${
                daysUntilDeadline <= 3 ? 'text-red-800' : daysUntilDeadline <= 7 ? 'text-orange-800' : 'text-blue-800'
              }`}>
                Submission deadline: {new Date(tender.submissionDeadline).toLocaleDateString()} 
                ({daysUntilDeadline} days remaining)
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="proposedAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Proposed Amount *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  id="proposedAmount"
                  {...register('proposedAmount', { 
                    required: 'Proposed amount is required',
                    min: { value: 1, message: 'Amount must be greater than 0' }
                  })}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              {errors.proposedAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.proposedAmount.message}</p>
              )}
              {proposedAmount && (
                <p className="mt-1 text-sm text-gray-500">
                  Amount: {formatCurrency(parseFloat(proposedAmount) || 0)}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Proposal Notes
              </label>
              <textarea
                id="notes"
                rows={6}
                {...register('notes')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your approach, timeline, experience, and any additional value you can provide..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Include details about your experience, proposed timeline, methodology, and any additional services.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Documents
              </label>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Click to upload documents
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, Word, Excel files up to 10MB each
                    </p>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Uploaded Files:</h4>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-blue-100 rounded">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Once submitted, your proposal cannot be modified. Please review all information carefully before submitting.
                  </p>
                </div>
              </div>
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
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}