import { useState, useRef } from 'react'
import { 
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface ProductImageGalleryProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  allowUpload?: boolean
  allowDelete?: boolean
  className?: string
}

interface ImageModalProps {
  isOpen: boolean
  images: string[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

const ImageModal = ({ isOpen, images, currentIndex, onClose, onNavigate }: ImageModalProps) => {
  if (!isOpen || images.length === 0) return null

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
    onNavigate(newIndex)
  }

  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
    onNavigate(newIndex)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowLeft') {
      handlePrevious()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <ArrowRightIcon className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`Product image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}

export function ProductImageGallery({ 
  images, 
  onImagesChange, 
  maxImages = 10, 
  allowUpload = true, 
  allowDelete = true,
  className = ''
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !allowUpload) return

    const newImages: string[] = []
    const remainingSlots = maxImages - images.length

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string)
            if (newImages.length === Math.min(files.length, remainingSlots)) {
              onImagesChange([...images, ...newImages])
            }
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteImage = (index: number) => {
    if (!allowDelete) return
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
  }

  const canAddMore = allowUpload && images.length < maxImages

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={image}
              alt={`Product image ${index + 1}`}
              className="w-full h-full object-cover rounded-lg border border-secondary-200 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleImageClick(index)}
            />
            
            {/* Image Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleImageClick(index)}
                  className="p-2 bg-white text-secondary-600 hover:text-secondary-900 rounded-lg shadow-lg"
                  title="View Full Size"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </button>
                {allowDelete && (
                  <button
                    onClick={() => handleDeleteImage(index)}
                    className="p-2 bg-white text-error-600 hover:text-error-800 rounded-lg shadow-lg"
                    title="Delete Image"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Primary Image Badge */}
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium">
                Primary
              </div>
            )}
          </div>
        ))}

        {/* Upload Area */}
        {canAddMore && (
          <div
            className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-primary-400 bg-primary-50'
                : 'border-secondary-300 hover:border-secondary-400 hover:bg-secondary-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <PhotoIcon className="h-8 w-8 text-secondary-400 mb-2" />
            <p className="text-sm text-secondary-600 text-center px-2">
              {dragOver ? 'Drop images here' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-secondary-500 mt-1">
              {maxImages - images.length} remaining
            </p>
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      {canAddMore && (
        <div className="text-sm text-secondary-600">
          <p>• Supported formats: JPG, PNG, GIF, WebP</p>
          <p>• Maximum {maxImages} images per product</p>
          <p>• First image will be used as the primary product image</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Image Modal */}
      {selectedImageIndex !== null && (
        <ImageModal
          isOpen={true}
          images={images}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
          onNavigate={setSelectedImageIndex}
        />
      )}
    </div>
  )
}