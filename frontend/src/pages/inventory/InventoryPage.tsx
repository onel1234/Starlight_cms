import { useState } from 'react'
import { InventoryDashboard } from '../../components/inventory/InventoryDashboard'
import { ProductCatalog } from '../../components/inventory/ProductCatalog'
import { SupplierManagement } from '../../components/inventory/SupplierManagement'
import { StockMovementHistory } from '../../components/inventory/StockMovementHistory'
import { 
  ChartBarIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

type TabType = 'dashboard' | 'products' | 'suppliers' | 'movements'

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: 'Dashboard',
      icon: ChartBarIcon,
      description: 'Overview and key metrics'
    },
    {
      id: 'products' as TabType,
      name: 'Products',
      icon: CubeIcon,
      description: 'Product catalog and inventory'
    },
    {
      id: 'suppliers' as TabType,
      name: 'Suppliers',
      icon: BuildingStorefrontIcon,
      description: 'Supplier management'
    },
    {
      id: 'movements' as TabType,
      name: 'Stock History',
      icon: ClockIcon,
      description: 'Stock movement history'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <InventoryDashboard />
      case 'products':
        return <ProductCatalog />
      case 'suppliers':
        return <SupplierManagement />
      case 'movements':
        return <StockMovementHistory />
      default:
        return <InventoryDashboard />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Inventory Management</h1>
        <p className="mt-1 text-sm text-secondary-600">
          Manage products, stock levels, suppliers, and track inventory movements.
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-secondary-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <Icon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeTab === tab.id
                      ? 'text-primary-500'
                      : 'text-secondary-400 group-hover:text-secondary-500'
                  }`}
                />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  )
}