import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    CheckCircleIcon,
    XCircleIcon,
    AlertTriangleIcon,
    InfoIcon,
    PlusIcon,
    FolderIcon,
    UsersIcon
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import {
    LoadingOverlay,
    PageLoading,
    ButtonLoading,
    InlineLoading,
    EmptyState,
    TableLoading,
    FormLoading
} from '../components/ui/LoadingStates'
import {
    Skeleton,
    SkeletonText,
    SkeletonCard,
    SkeletonTable,
    SkeletonList,
    SkeletonDashboard
} from '../components/ui/Skeleton'
import {
    ResponsiveContainer,
    ResponsiveGrid,
    ResponsiveStack,
    ResponsiveText
} from '../components/ui/ResponsiveContainer'
import { ErrorBoundary, ErrorFallback } from '../components/ui/ErrorBoundary'
import { DocumentManagementDemo } from '../components/documents/DocumentManagementDemo'

export function ComponentShowcasePage() {
    const { success, error, warning, info } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [showError, setShowError] = useState(false)

    const handleToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
        const messages = {
            success: { title: 'Success!', message: 'Operation completed successfully.' },
            error: { title: 'Error occurred', message: 'Something went wrong. Please try again.' },
            warning: { title: 'Warning', message: 'Please review your input before proceeding.' },
            info: { title: 'Information', message: 'Here is some helpful information.' }
        }

        const toastFunctions = { success, error, warning, info }
        const { title, message } = messages[type]

        toastFunctions[type](title, message, {
            action: {
                label: 'View Details',
                onClick: () => console.log(`${type} action clicked`)
            }
        })
    }

    const handleLoadingDemo = async () => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsLoading(false)
        success('Loading Demo', 'Loading completed successfully!')
    }

    const ErrorComponent = () => {
        if (showError) {
            throw new Error('This is a demo error for testing the error boundary')
        }
        return <div>No error here!</div>
    }

    return (
        <ResponsiveContainer className="py-8">
            <div className="space-y-12">
                {/* Header */}
                <div className="text-center">
                    <ResponsiveText size="3xl" weight="bold" color="primary">
                        Component Showcase
                    </ResponsiveText>
                    <ResponsiveText size="lg" color="muted" className="mt-2">
                        Demonstration of all UI components and layout features
                    </ResponsiveText>
                </div>

                {/* Toast Notifications */}
                <section className="card">
                    <h2 className="text-xl font-semibold text-black mb-4">
                        Toast Notifications
                    </h2>
                    <ResponsiveGrid cols={{ default: 2, lg: 4 }}>
                        <button
                            onClick={() => handleToastDemo('success')}
                            className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                            <CheckCircleIcon className="h-5 w-5" />
                            Success Toast
                        </button>
                        <button
                            onClick={() => handleToastDemo('error')}
                            className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <XCircleIcon className="h-5 w-5" />
                            Error Toast
                        </button>
                        <button
                            onClick={() => handleToastDemo('warning')}
                            className="flex items-center justify-center gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                            <AlertTriangleIcon className="h-5 w-5" />
                            Warning Toast
                        </button>
                        <button
                            onClick={() => handleToastDemo('info')}
                            className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <InfoIcon className="h-5 w-5" />
                            Info Toast
                        </button>
                    </ResponsiveGrid>
                </section>

                {/* Loading States */}
                <section className="card">
                    <h2 className="text-xl font-semibold text-black mb-4">
                        Loading States
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-secondary-700 mb-3">
                                Loading Spinners
                            </h3>
                            <ResponsiveStack direction="horizontal" spacing="lg" align="center">
                                <div className="text-center">
                                    <LoadingSpinner size="sm" />
                                    <p className="text-xs text-secondary-600 mt-1">Small</p>
                                </div>
                                <div className="text-center">
                                    <LoadingSpinner size="md" />
                                    <p className="text-xs text-secondary-600 mt-1">Medium</p>
                                </div>
                                <div className="text-center">
                                    <LoadingSpinner size="lg" />
                                    <p className="text-xs text-secondary-600 mt-1">Large</p>
                                </div>
                            </ResponsiveStack>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-secondary-700 mb-3">
                                Interactive Loading
                            </h3>
                            <ResponsiveStack direction="responsive" spacing="md">
                                <ButtonLoading
                                    isLoading={isLoading}
                                    onClick={handleLoadingDemo}
                                    className="btn-primary"
                                >
                                    {isLoading ? 'Loading...' : 'Start Loading Demo'}
                                </ButtonLoading>
                                <InlineLoading message="Processing..." />
                            </ResponsiveStack>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-secondary-700 mb-3">
                                Loading Overlay Demo
                            </h3>
                            <LoadingOverlay isLoading={isLoading} className="h-32 bg-secondary-100 rounded-lg">
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-secondary-600">
                                        Content behind loading overlay
                                    </p>
                                </div>
                            </LoadingOverlay>
                        </div>
                    </div>
                </section>

                {/* Skeleton Components */}
                <section className="card">
                    <h2 className="text-xl font-semibold text-black mb-4">
                        Skeleton Loading
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-secondary-700 mb-3">
                                Basic Skeletons
                            </h3>
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-12 w-12 rounded-full" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-secondary-700 mb-3">
                                Skeleton Text
                            </h3>
                            <SkeletonText lines={3} />
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-secondary-700 mb-3">
                                Skeleton Card
                            </h3>
                            <SkeletonCard />
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-secondary-700 mb-3">
                                Skeleton List
                            </h3>
                            <SkeletonList items={3} />
                        </div>
                    </div>
                </section>

                {/* Error Boundary */}
                <section className="card">
                    <h2 className="text-xl font-semibold text-black mb-4">
                        Error Handling
                    </h2>
                    <div className="space-y-4">
                        <ResponsiveStack direction="responsive" spacing="md">
                            <button
                                onClick={() => setShowError(!showError)}
                                className={`btn-${showError ? 'secondary' : 'primary'}`}
                            >
                                {showError ? 'Hide Error' : 'Trigger Error'}
                            </button>
                        </ResponsiveStack>

                        <ErrorBoundary>
                            <ErrorComponent />
                        </ErrorBoundary>
                    </div>
                </section>

                {/* Empty States */}
                <section className="card">
                    <h2 className="text-xl font-semibold text-black mb-4">
                        Empty States
                    </h2>
                    <ResponsiveGrid cols={{ default: 1, lg: 2 }}>
                        <EmptyState
                            icon={FolderIcon}
                            title="No projects found"
                            description="Get started by creating your first project."
                            action={{
                                label: 'Create Project',
                                onClick: () => info('Action', 'Create project clicked!')
                            }}
                        />
                        <EmptyState
                            icon={UsersIcon}
                            title="No team members"
                            description="Invite team members to collaborate on projects."
                            action={{
                                label: 'Invite Members',
                                onClick: () => info('Action', 'Invite members clicked!')
                            }}
                        />
                    </ResponsiveGrid>
                </section>

                {/* Responsive Components */}
                <section className="card">
                    <h2 className="text-xl font-semibold text-black mb-4">
                        Responsive Layout
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-secondary-700 mb-3">
                                Responsive Grid
                            </h3>
                            <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3, xl: 4 }}>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="bg-primary-50 p-4 rounded-lg text-center">
                                        <ResponsiveText color="primary">Item {i + 1}</ResponsiveText>
                                    </div>
                                ))}
                            </ResponsiveGrid>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-secondary-700 mb-3">
                                Responsive Stack
                            </h3>
                            <ResponsiveStack direction="responsive" spacing="md" justify="between">
                                <ResponsiveText size="lg" weight="semibold">
                                    Responsive Text
                                </ResponsiveText>
                                <button className="btn-primary">
                                    Action Button
                                </button>
                            </ResponsiveStack>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-secondary-700 mb-3">
                                Responsive Text Sizes
                            </h3>
                            <div className="space-y-2">
                                <ResponsiveText size="xs">Extra small responsive text</ResponsiveText>
                                <ResponsiveText size="sm">Small responsive text</ResponsiveText>
                                <ResponsiveText size="base">Base responsive text</ResponsiveText>
                                <ResponsiveText size="lg">Large responsive text</ResponsiveText>
                                <ResponsiveText size="xl">Extra large responsive text</ResponsiveText>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Document Management Demo */}
                <section className="card">
                    <h2 className="text-xl font-semibold text-black mb-4">
                        Document Management System
                    </h2>
                    <DocumentManagementDemo />
                </section>

                {/* Animation Examples */}
                <section className="card">
                    <h2 className="text-xl font-semibold text-black mb-4">
                        Animations
                    </h2>
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="p-4 bg-gradient-to-r from-primary-50 to-secondary-100 rounded-lg"
                        >
                            <ResponsiveText>
                                This content animates in with a fade and slide effect
                            </ResponsiveText>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary"
                        >
                            Hover and click me for animations
                        </motion.button>
                    </div>
                </section>
            </div>
        </ResponsiveContainer>
    )
}