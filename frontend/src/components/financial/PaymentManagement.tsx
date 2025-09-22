import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { usePayments, useCreatePayment, useInvoices } from '../../hooks/useFinancial';
import { Payment, PaymentStatus, Invoice } from '../../types/financial';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

const statusConfig = {
  'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
  'Paid': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  'Partial': { color: 'bg-blue-100 text-blue-800', icon: BanknotesIcon },
  'Overdue': { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
  'Cancelled': { color: 'bg-gray-100 text-gray-800', icon: ExclamationTriangleIcon },
  'Draft': { color: 'bg-gray-100 text-gray-800', icon: ClockIcon }
};

const paymentMethods = [
  'Bank Transfer',
  'Credit Card',
  'Check',
  'Cash',
  'Wire Transfer',
  'Online Payment'
];

interface CreatePaymentData {
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  reference?: string;
  notes?: string;
}

export const PaymentManagement: React.FC = () => {
  const { success, error } = useToast();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { data: invoices } = useInvoices();
  const createPayment = useCreatePayment();

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  const [formData, setFormData] = useState<CreatePaymentData>({
    invoiceId: 0,
    amount: 0,
    paymentMethod: 'Bank Transfer',
    paymentDate: new Date(),
    reference: '',
    notes: ''
  });

  // Get unpaid and partially paid invoices
  const unpaidInvoices = invoices?.filter(invoice => 
    invoice.status === 'Sent' || invoice.status === 'Overdue' || invoice.status === 'Partial'
  ) || [];

  const filteredPayments = payments?.filter(payment => 
    statusFilter === 'All' || payment.status === statusFilter
  ) || [];

  // Calculate payment statistics
  const paymentStats = {
    totalReceived: payments?.reduce((sum, p) => p.status === 'Paid' ? sum + p.amount : sum, 0) || 0,
    pendingAmount: payments?.reduce((sum, p) => p.status === 'Pending' ? sum + p.amount : sum, 0) || 0,
    overdueAmount: invoices?.reduce((sum, inv) => inv.status === 'Overdue' ? sum + inv.totalAmount : sum, 0) || 0,
    partialPayments: payments?.filter(p => p.status === 'Partial').length || 0
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setFormData({
      invoiceId: 0,
      amount: 0,
      paymentMethod: 'Bank Transfer',
      paymentDate: new Date(),
      reference: '',
      notes: ''
    });
  };

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    
    // Calculate remaining amount to pay
    const paidAmount = payments?.filter(p => 
      p.invoiceId === invoice.id && (p.status === 'Paid' || p.status === 'Partial')
    ).reduce((sum, p) => sum + p.amount, 0) || 0;
    
    const remainingAmount = invoice.totalAmount - paidAmount;
    
    setFormData(prev => ({
      ...prev,
      invoiceId: invoice.id,
      amount: remainingAmount
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.invoiceId) {
        error('Please select an invoice');
        return;
      }

      if (formData.amount <= 0) {
        error('Please enter a valid payment amount');
        return;
      }

      await createPayment.mutateAsync({
        invoiceId: formData.invoiceId,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        transactionId: formData.reference,
        notes: formData.notes,
        status: 'Paid',
        createdBy: 1 // Mock user ID
      });
      
      success('Payment recorded successfully');
      setIsCreating(false);
      setSelectedInvoice(null);
    } catch (err) {
      error('Failed to record payment');
    }
  };

  const sendPaymentReminder = async (invoice: Invoice) => {
    // Mock reminder functionality
    success(`Payment reminder sent for invoice ${invoice.invoiceNumber}`);
  };

  if (paymentsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Payment Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track payments with status monitoring and reminder system
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Received</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${paymentStats.totalReceived.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${paymentStats.pendingAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${paymentStats.overdueAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Partial Payments</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {paymentStats.partialPayments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'All')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Overdue">Overdue</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Create Payment Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Record New Payment
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoice Selection */}
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Select Invoice
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {unpaidInvoices.map((invoice) => {
                  const paidAmount = payments?.filter(p => 
                    p.invoiceId === invoice.id && (p.status === 'Paid' || p.status === 'Partial')
                  ).reduce((sum, p) => sum + p.amount, 0) || 0;
                  
                  const remainingAmount = invoice.totalAmount - paidAmount;
                  
                  return (
                    <div
                      key={invoice.id}
                      onClick={() => handleInvoiceSelect(invoice)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedInvoice?.id === invoice.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {invoice.invoiceNumber}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Customer: {invoice.customer?.firstName ? `${invoice.customer.firstName} ${invoice.customer.lastName}` : `ID: ${invoice.customerId}`}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Due: {invoice.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${remainingAmount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            of ${invoice.totalAmount.toFixed(2)}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusConfig[invoice.status].color}`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter payment amount"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={formData.paymentDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: new Date(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reference/Transaction ID
                </label>
                <input
                  type="text"
                  value={formData.reference || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter reference number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedInvoice(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={createPayment.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payments List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Payment History ({filteredPayments.length})
          </h3>
          
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No payments found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => {
                const StatusIcon = statusConfig[payment.status].icon;
                const invoice = invoices?.find(inv => inv.id === payment.invoiceId);
                
                return (
                  <div
                    key={payment.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            Payment #{payment.id}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[payment.status].color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {payment.status}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Invoice:</span> {invoice?.invoiceNumber || `ID: ${payment.invoiceId}`}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span> ${payment.amount.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Method:</span> {payment.paymentMethod}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {payment.paymentDate.toLocaleDateString()}
                          </div>
                        </div>
                        {payment.transactionId && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Reference: {payment.transactionId}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overdue Invoices Alert */}
      {unpaidInvoices.filter(inv => inv.status === 'Overdue').length > 0 && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h3 className="ml-2 text-sm font-medium text-red-800 dark:text-red-200">
              Overdue Invoices Require Attention
            </h3>
          </div>
          <div className="mt-2 space-y-2">
            {unpaidInvoices.filter(inv => inv.status === 'Overdue').map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between text-sm">
                <span className="text-red-700 dark:text-red-300">
                  {invoice.invoiceNumber} - ${invoice.totalAmount.toFixed(2)} (Due: {invoice.dueDate.toLocaleDateString()})
                </span>
                <button
                  onClick={() => sendPaymentReminder(invoice)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >
                  Send Reminder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPayment(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payment Details
                </h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Payment ID</h4>
                  <p className="text-gray-600 dark:text-gray-400">#{selectedPayment.id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Amount</h4>
                  <p className="text-gray-600 dark:text-gray-400">${selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Payment Method</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedPayment.paymentMethod}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Payment Date</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedPayment.paymentDate.toLocaleDateString()}</p>
                </div>
                {selectedPayment.transactionId && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Transaction ID</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedPayment.transactionId}</p>
                  </div>
                )}
                {selectedPayment.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Notes</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedPayment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};