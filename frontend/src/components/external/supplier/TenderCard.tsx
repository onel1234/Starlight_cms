import React from 'react'
import { Link } from 'react-router-dom'
import { SupplierTender } from '../../../types/external'
import { formatCurrency, formatDate } from '../../../utils/formatters'

interface TenderCardProps {
  tender: SupplierTender
}

export const TenderCard: React.FC<TenderCardProps> = ({ tender }) => {
  const daysUntilDeadline = Math.ceil(
    (new Date(tender.submissionDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const getUrgencyColor = (days: number) => {
    if (days <= 3) return 'text-red-600 bg-red-50'
    if (days <= 7) return 'text-orange-600 bg-orange-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {tender.title}
          </h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {tender.category}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {tender.description}
        </p>

        {/* Deadline Warning */}
        <div className={`p-3 rounded-lg mb-4 ${getUrgencyColor(daysUntilDeadline)}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Deadline passed'}
            </span>
            <span className="text-xs">
              Due: {formatDate(tender.submissionDeadline)}
            </span>
          </div>
        </div>

        {/* Tender Details */}
        <div className="space-y-2 mb-4">
          {tender.estimatedValue && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated Value:</span>
              <span className="font-medium">{formatCurrency(tender.estimatedValue)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Requirements:</span>
            <span className="font-medium">{tender.requirements.length} items</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Documents:</span>
            <span className="font-medium">{tender.documents.length} files</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-600">Contact Person</p>
          <p className="text-sm font-medium text-gray-900">{tender.contactPerson}</p>
          <p className="text-xs text-gray-600">{tender.contactEmail}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/supplier/tenders/${tender.id}`}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center text-sm"
          >
            View Details
          </Link>
          <Link
            to={`/supplier/tenders/${tender.id}/quote`}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center text-sm"
          >
            Submit Quote
          </Link>
        </div>
      </div>
    </div>
  )
}