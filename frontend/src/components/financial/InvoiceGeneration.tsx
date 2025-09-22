import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentArrowDownIcon,
  EnvelopeIcon,
  EyeIcon,
  PencilIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useInvoices, useCreateInvoice, useUpdateInvoice, useGeneratePDF, useSendEmail } from '../../hooks/useFinancial';
import { Invoice, InvoiceStatus, CreateInvoiceData } from '../../types/financial';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

const statusConfig = {
  'Draft': { color: 'bg-gray-100 text-gray-800' },
  'Sent': { color: 'bg-blue-100 text-blue-800' },
  'Paid': { color: 'bg-green-100 text-green-800' },
  'Partial': { color: 'bg-yellow-100 text-yellow-800' },
  'Overdue': { color: 'bg-red-100 text-red-800' }
};

export const InvoiceGeneration: React.FC = () => {
  const { success, error } = useToast();
  const { data: invoices, isLoading } = useInvoices();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const generatePDF = useGeneratePDF();
  const sendEmail = useSendEmail();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'All'>('All');

  const [emailRecipient, setEmailRecipient] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  const [formData, setFormData] = useState<CreateInvoiceData>({
    customerId: 0,
    purchaseOrderId: undefined,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    notes: '',
    items: []
  });

  const filteredInvoices = invoices?.filter(invoice =>
    statusFilter === 'All' || invoice.status === statusFilter
  ) || [];

  const handleCreateNew = () => {
    setSelectedInvoice(null);
    setIsCreating(true);
    setIsEditing(false);
    const now = new Date();
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    setFormData({
      customerId: 0,
      purchaseOrderId: undefined,
      issueDate: now,
      dueDate,
      notes: '',
      items: []
    });
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditing(true);
    setIsCreating(false);
    setFormData({
      customerId: invoice.customerId,
      purchaseOrderId: invoice.purchaseOrderId,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      notes: invoice.notes || '',
      items: invoice.items?.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        description: item.description
      })) || []
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.customerId) {
        error('Please select a customer');
        return;
      }

      const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = totalAmount * 0.1; // 10% tax

      const invoiceData = {
        ...formData,
        totalAmount: totalAmount + taxAmount,
        taxAmount,
        discountAmount: 0,
        items: formData.items.map(item => ({
          ...item,
          id: 0,
          invoiceId: selectedInvoice?.id || 0,
          totalPrice: item.quantity * item.unitPrice
        }))
      };

      if (isEditing && selectedInvoice) {
        await updateInvoice.mutateAsync({
          id: selectedInvoice.id,
          data: invoiceData
        });
        success('Invoice updated successfully');
      } else {
        await createInvoice.mutateAsync(invoiceData);
        success('Invoice created successfully');
      }

      setIsCreating(false);
      setIsEditing(false);
      setSelectedInvoice(null);
    } catch (err) {
      error('Failed to save invoice');
    }
  };

  const handleGeneratePDF = async (invoice: Invoice) => {
    try {
      const pdfBlob = await generatePDF.mutateAsync({ type: 'invoice', id: invoice.id });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      success('PDF generated successfully');
    } catch (err) {
      error('Failed to generate PDF');
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    if (!emailRecipient) {
      error('Please enter email recipient');
      return;
    }

    try {
      await sendEmail.mutateAsync({
        type: 'invoice',
        id: invoice.id,
        email: emailRecipient
      });
      success('Invoice sent successfully');
      setShowEmailDialog(false);
      setEmailRecipient('');
    } catch (err) {
      error('Failed to send invoice');
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: 0,
        quantity: 1,
        unitPrice: 0,
        description: ''
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * 0.1;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Invoice Generation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generate invoices with PDF preview and email functionality
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span>New Invoice</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'All')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="All">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
          </h3>

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer ID
                </label>
                <input
                  type="number"
                  value={formData.customerId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerId: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter customer ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purchase Order ID (Optional)
                </label>
                <input
                  type="number"
                  value={formData.purchaseOrderId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseOrderId: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter purchase order ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formData.issueDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: new Date(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: new Date(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Items</h4>
                <button
                  onClick={addItem}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <input
                      type="number"
                      placeholder="Product ID"
                      value={item.productId || ''}
                      onChange={(e) => updateItem(index, 'productId', parseInt(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description || ''}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                      step="0.01"
                    />
                    <span className="w-24 text-right font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              {formData.items.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="space-y-2 text-right">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${calculateTotals().subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>${calculateTotals().taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>${calculateTotals().total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Additional notes..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={createInvoice.isPending || updateInvoice.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isEditing ? 'Update' : 'Create'} Invoice
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Invoices List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Invoices ({filteredInvoices.length})
          </h3>

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No invoices found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          Invoice #{invoice.invoiceNumber}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[invoice.status].color}`}>
                          {invoice.status}
                        </span>
                        {invoice.status === 'Overdue' && (
                          <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            Overdue
                          </span>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Customer:</span> {invoice.customer?.firstName ? `${invoice.customer.firstName} ${invoice.customer.lastName}` : `ID: ${invoice.customerId}`}
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span> ${invoice.totalAmount.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Issue Date:</span> {invoice.issueDate.toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Due Date:</span> {invoice.dueDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleGeneratePDF(invoice)}
                        disabled={generatePDF.isPending}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                        title="Generate PDF"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowEmailDialog(true);
                        }}
                        className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded"
                        title="Send Email"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Dialog */}
      {showEmailDialog && selectedInvoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowEmailDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Send Invoice via Email
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEmailDialog(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendEmail(selectedInvoice)}
                    disabled={sendEmail.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && !isEditing && !showEmailDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedInvoice(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Invoice Details
                </h3>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Invoice Number</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Status</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedInvoice.status].color}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Customer</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedInvoice.customer?.firstName ? `${selectedInvoice.customer.firstName} ${selectedInvoice.customer.lastName}` : `ID: ${selectedInvoice.customerId}`}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Total Amount</h4>
                    <p className="text-gray-600 dark:text-gray-400">${selectedInvoice.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Issue Date</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedInvoice.issueDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Due Date</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedInvoice.dueDate.toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Items</h4>
                    <div className="space-y-2">
                      {selectedInvoice.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <div>
                            <span className="font-medium">{item.description}</span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              {item.quantity} × ${item.unitPrice.toFixed(2)}
                            </span>
                          </div>
                          <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedInvoice.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Notes</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedInvoice.notes}</p>
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