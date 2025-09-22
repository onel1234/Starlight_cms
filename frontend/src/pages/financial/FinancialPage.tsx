import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon, 
  DocumentTextIcon, 
  ShoppingCartIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { QuotationBuilder } from '../../components/financial/QuotationBuilder';
import { PurchaseOrderManagement } from '../../components/financial/PurchaseOrderManagement';
import { InvoiceGeneration } from '../../components/financial/InvoiceGeneration';
import { PaymentManagement } from '../../components/financial/PaymentManagement';
import { FinancialReporting } from '../../components/financial/FinancialReporting';
import { AutomatedReminders } from '../../components/financial/AutomatedReminders';

type FinancialTab = 'quotations' | 'purchase-orders' | 'invoices' | 'payments' | 'reports' | 'reminders';

const tabs = [
  { id: 'quotations' as FinancialTab, name: 'Quotations', icon: DocumentTextIcon },
  { id: 'purchase-orders' as FinancialTab, name: 'Purchase Orders', icon: ShoppingCartIcon },
  { id: 'invoices' as FinancialTab, name: 'Invoices', icon: CurrencyDollarIcon },
  { id: 'payments' as FinancialTab, name: 'Payments', icon: CreditCardIcon },
  { id: 'reports' as FinancialTab, name: 'Reports', icon: ChartBarIcon },
  { id: 'reminders' as FinancialTab, name: 'Reminders', icon: ClockIcon },
];

export const FinancialPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinancialTab>('quotations');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'quotations':
        return <QuotationBuilder />;
      case 'purchase-orders':
        return <PurchaseOrderManagement />;
      case 'invoices':
        return <InvoiceGeneration />;
      case 'payments':
        return <PaymentManagement />;
      case 'reports':
        return <FinancialReporting />;
      case 'reminders':
        return <AutomatedReminders />;
      default:
        return <QuotationBuilder />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage quotations, purchase orders, invoices, and payments
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-[600px]"
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
};