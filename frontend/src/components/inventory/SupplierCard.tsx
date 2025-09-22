import { useState } from 'react'
import { Supplier } from '../../types/inventory'
import { SupplierForm } from './SupplierForm'
import { 
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface SupplierCardProps {
  supplier: Supplier
}

export function SupplierCard({ supplier }: SupplierCardProps) {
  const [showEditForm, setShowEditForm] = useState(false)

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-4 w-4 text-secondary-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarIconSolid className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
        )
      } else {
        stars.push(
          <StarIcon key={i} className="h-4 w-4 text-secondary-300" />
        )
      }
    }

    return stars
  }

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BuildingStorefrontIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">{supplier.companyName}</h3>
              <div className="flex items-center space-x-1 mt-1">
                {renderStars(supplier.rating)}
                <span className="text-sm text-secondary-600 ml-1">
                  ({supplier.rating.toFixed(1)})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              supplier.status === 'Active'
                ? 'bg-success-100 text-success-800'
                : 'bg-secondary-100 text-secondary-800'
            }`}>
              {supplier.status}
            </span>
            <button
              onClick={() => setShowEditForm(true)}
              className="p-1 text-secondary-400 hover:text-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          {supplier.contactPerson && (
            <div className="flex items-center text-sm text-secondary-600">
              <span className="font-medium w-20">Contact:</span>
              <span>{supplier.contactPerson}</span>
            </div>
          )}

          {supplier.email && (
            <div className="flex items-center text-sm text-secondary-600">
              <EnvelopeIcon className="h-4 w-4 mr-2 text-secondary-400" />
              <a 
                href={`mailto:${supplier.email}`}
                className="text-primary-600 hover:text-primary-800 truncate"
              >
                {supplier.email}
              </a>
            </div>
          )}

          {supplier.phone && (
            <div className="flex items-center text-sm text-secondary-600">
              <PhoneIcon className="h-4 w-4 mr-2 text-secondary-400" />
              <a 
                href={`tel:${supplier.phone}`}
                className="text-primary-600 hover:text-primary-800"
              >
                {supplier.phone}
              </a>
            </div>
          )}

          {supplier.address && (
            <div className="flex items-start text-sm text-secondary-600">
              <MapPinIcon className="h-4 w-4 mr-2 text-secondary-400 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{supplier.address}</span>
            </div>
          )}
        </div>

        {/* Business Information */}
        <div className="mt-4 pt-4 border-t border-secondary-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {supplier.paymentTerms && (
              <div>
                <span className="text-secondary-500">Payment Terms:</span>
                <p className="font-medium text-secondary-900">{supplier.paymentTerms}</p>
              </div>
            )}

            {supplier.taxNumber && (
              <div>
                <span className="text-secondary-500">Tax Number:</span>
                <p className="font-medium text-secondary-900 truncate" title={supplier.taxNumber}>
                  {supplier.taxNumber}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-4 pt-4 border-t border-secondary-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary-500">Performance Rating</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(supplier.rating)}
              </div>
              <span className="font-medium text-secondary-900">
                {supplier.rating.toFixed(1)}/5.0
              </span>
            </div>
          </div>

          {/* Rating Bar */}
          <div className="mt-2 w-full bg-secondary-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500"
              style={{ width: `${(supplier.rating / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-secondary-200 flex items-center justify-between text-xs text-secondary-500">
          <span>Added {new Date(supplier.createdAt).toLocaleDateString()}</span>
          <span>Updated {new Date(supplier.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Edit Supplier Modal */}
      {showEditForm && (
        <SupplierForm
          supplier={supplier}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => setShowEditForm(false)}
        />
      )}
    </>
  )
}