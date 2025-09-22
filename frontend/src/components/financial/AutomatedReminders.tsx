import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  EnvelopeIcon,
  BellIcon,
  CalendarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { useInvoices } from '../../hooks/useFinancial';
import { Invoice } from '../../types/financial';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

interface ReminderRule {
  id: number;
  name: string;
  type: 'payment_due' | 'overdue' | 'follow_up';
  triggerDays: number;
  isActive: boolean;
  emailTemplate: string;
  recipients: string[];
  lastRun?: Date;
  nextRun?: Date;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  type: 'payment_due' | 'overdue' | 'follow_up';
}

const mockReminderRules: ReminderRule[] = [
  {
    id: 1,
    name: 'Payment Due Reminder',
    type: 'payment_due',
    triggerDays: 3,
    isActive: true,
    emailTemplate: 'Payment Due Template',
    recipients: ['customer@email.com'],
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 2,
    name: 'Overdue Payment Alert',
    type: 'overdue',
    triggerDays: 0,
    isActive: true,
    emailTemplate: 'Overdue Payment Template',
    recipients: ['customer@email.com', 'accounts@company.com'],
    lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000)
  },
  {
    id: 3,
    name: 'Follow-up Reminder',
    type: 'follow_up',
    triggerDays: 7,
    isActive: false,
    emailTemplate: 'Follow-up Template',
    recipients: ['customer@email.com'],
    lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
];

const mockEmailTemplates: EmailTemplate[] = [
  {
    id: 1,
    name: 'Payment Due Template',
    subject: 'Payment Due Reminder - Invoice #{invoiceNumber}',
    body: `Dear {customerName},

This is a friendly reminder that your invoice #{invoiceNumber} for {totalAmount} is due on {dueDate}.

Please ensure payment is made by the due date to avoid any late fees.

If you have already made the payment, please disregard this message.

Best regards,
Star Light Constructions`,
    type: 'payment_due'
  },
  {
    id: 2,
    name: 'Overdue Payment Template',
    subject: 'URGENT: Overdue Payment - Invoice #{invoiceNumber}',
    body: `Dear {customerName},

Your invoice #{invoiceNumber} for {totalAmount} was due on {dueDate} and is now overdue.

Please make immediate payment to avoid additional charges and maintain your account in good standing.

If you have any questions or need to discuss payment arrangements, please contact us immediately.

Best regards,
Star Light Constructions`,
    type: 'overdue'
  },
  {
    id: 3,
    name: 'Follow-up Template',
    subject: 'Follow-up: Invoice #{invoiceNumber}',
    body: `Dear {customerName},

We wanted to follow up regarding invoice #{invoiceNumber} for {totalAmount}.

If you have any questions about this invoice or need assistance, please don't hesitate to contact us.

We appreciate your business and look forward to your prompt payment.

Best regards,
Star Light Constructions`,
    type: 'follow_up'
  }
];

export const AutomatedReminders: React.FC = () => {
  const { success } = useToast();
  const { data: invoices, isLoading } = useInvoices();
  
  const [reminderRules, setReminderRules] = useState<ReminderRule[]>(mockReminderRules);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [activeTab, setActiveTab] = useState<'rules' | 'templates' | 'history'>('rules');
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);


  const [ruleForm, setRuleForm] = useState({
    name: '',
    type: 'payment_due' as ReminderRule['type'],
    triggerDays: 3,
    emailTemplate: '',
    recipients: ['']
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'payment_due' as EmailTemplate['type']
  });

  // Get invoices that need reminders
  const getInvoicesNeedingReminders = () => {
    if (!invoices) return [];
    
    const now = new Date();
    return invoices.filter(invoice => {
      const dueDate = new Date(invoice.dueDate);
      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return (
        (invoice.status === 'Sent' && daysDiff <= 3) || // Due soon
        (invoice.status === 'Overdue') || // Already overdue
        (invoice.status === 'Partial') // Partial payment
      );
    });
  };

  const handleCreateRule = () => {
    const newRule: ReminderRule = {
      id: Math.max(...reminderRules.map(r => r.id)) + 1,
      name: ruleForm.name,
      type: ruleForm.type,
      triggerDays: ruleForm.triggerDays,
      isActive: true,
      emailTemplate: ruleForm.emailTemplate,
      recipients: ruleForm.recipients.filter(r => r.trim() !== ''),
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    setReminderRules([...reminderRules, newRule]);
    setIsCreatingRule(false);
    setRuleForm({
      name: '',
      type: 'payment_due',
      triggerDays: 3,
      emailTemplate: '',
      recipients: ['']
    });
    success('Reminder rule created successfully');
  };

  const handleCreateTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: Math.max(...emailTemplates.map(t => t.id)) + 1,
      name: templateForm.name,
      subject: templateForm.subject,
      body: templateForm.body,
      type: templateForm.type
    };

    setEmailTemplates([...emailTemplates, newTemplate]);
    setIsCreatingTemplate(false);
    setTemplateForm({
      name: '',
      subject: '',
      body: '',
      type: 'payment_due'
    });
    success('Email template created successfully');
  };

  const toggleRuleStatus = (ruleId: number) => {
    setReminderRules(rules => 
      rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive }
          : rule
      )
    );
    success('Reminder rule updated');
  };

  const deleteRule = (ruleId: number) => {
    if (window.confirm('Are you sure you want to delete this reminder rule?')) {
      setReminderRules(rules => rules.filter(rule => rule.id !== ruleId));
      success('Reminder rule deleted');
    }
  };

  const deleteTemplate = (templateId: number) => {
    if (window.confirm('Are you sure you want to delete this email template?')) {
      setEmailTemplates(templates => templates.filter(template => template.id !== templateId));
      success('Email template deleted');
    }
  };

  const sendManualReminder = (invoice: Invoice) => {
    success(`Manual reminder sent for invoice ${invoice.invoiceNumber}`);
  };

  const addRecipient = () => {
    setRuleForm(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }));
  };

  const updateRecipient = (index: number, value: string) => {
    setRuleForm(prev => ({
      ...prev,
      recipients: prev.recipients.map((recipient, i) => i === index ? value : recipient)
    }));
  };

  const removeRecipient = (index: number) => {
    setRuleForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const invoicesNeedingReminders = getInvoicesNeedingReminders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Automated Reminders
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage email templates and automated reminder scheduling
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsCreatingRule(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Rule</span>
          </button>
          <button
            onClick={() => setIsCreatingTemplate(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Urgent Reminders Alert */}
      {invoicesNeedingReminders.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="ml-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {invoicesNeedingReminders.length} Invoice(s) Need Attention
            </h3>
          </div>
          <div className="mt-2 space-y-2">
            {invoicesNeedingReminders.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between text-sm">
                <span className="text-yellow-700 dark:text-yellow-300">
                  {invoice.invoiceNumber} - ${invoice.totalAmount.toFixed(2)} 
                  ({invoice.status === 'Overdue' ? 'Overdue' : `Due ${invoice.dueDate.toLocaleDateString()}`})
                </span>
                <button
                  onClick={() => sendManualReminder(invoice)}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                >
                  Send Reminder
                </button>
              </div>
            ))}
            {invoicesNeedingReminders.length > 3 && (
              <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                +{invoicesNeedingReminders.length - 3} more invoices
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'rules', name: 'Reminder Rules', icon: ClockIcon },
            { id: 'templates', name: 'Email Templates', icon: EnvelopeIcon },
            { id: 'history', name: 'Reminder History', icon: CalendarIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm
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
      >
        {activeTab === 'rules' && (
          <div className="space-y-6">
            {/* Create Rule Form */}
            {isCreatingRule && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Create New Reminder Rule
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rule Name
                      </label>
                      <input
                        type="text"
                        value={ruleForm.name}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter rule name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reminder Type
                      </label>
                      <select
                        value={ruleForm.type}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="payment_due">Payment Due</option>
                        <option value="overdue">Overdue</option>
                        <option value="follow_up">Follow-up</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Trigger Days {ruleForm.type === 'overdue' ? 'After Due Date' : 'Before Due Date'}
                      </label>
                      <input
                        type="number"
                        value={ruleForm.triggerDays}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, triggerDays: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Template
                      </label>
                      <select
                        value={ruleForm.emailTemplate}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, emailTemplate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select template</option>
                        {emailTemplates.filter(t => t.type === ruleForm.type).map(template => (
                          <option key={template.id} value={template.name}>{template.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recipients
                    </label>
                    <div className="space-y-2">
                      {ruleForm.recipients.map((recipient, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="email"
                            value={recipient}
                            onChange={(e) => updateRecipient(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter email address"
                          />
                          {ruleForm.recipients.length > 1 && (
                            <button
                              onClick={() => removeRecipient(index)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={addRecipient}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        + Add recipient
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsCreatingRule(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateRule}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create Rule
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reminder Rules List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Reminder Rules ({reminderRules.length})
                </h3>
                
                <div className="space-y-4">
                  {reminderRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              {rule.name}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rule.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div>
                              <span className="font-medium">Type:</span> {rule.type.replace('_', ' ')}
                            </div>
                            <div>
                              <span className="font-medium">Trigger:</span> {rule.triggerDays} days
                            </div>
                            <div>
                              <span className="font-medium">Template:</span> {rule.emailTemplate}
                            </div>
                            <div>
                              <span className="font-medium">Recipients:</span> {rule.recipients.length}
                            </div>
                          </div>
                          {rule.nextRun && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              Next run: {rule.nextRun.toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleRuleStatus(rule.id)}
                            className={`p-2 rounded ${
                              rule.isActive 
                                ? 'text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900' 
                                : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                            }`}
                            title={rule.isActive ? 'Pause' : 'Activate'}
                          >
                            {rule.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setSelectedRule(rule)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteRule(rule.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Create Template Form */}
            {isCreatingTemplate && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Create New Email Template
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Template Name
                      </label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter template name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Template Type
                      </label>
                      <select
                        value={templateForm.type}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="payment_due">Payment Due</option>
                        <option value="overdue">Overdue</option>
                        <option value="follow_up">Follow-up</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter email subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Body
                    </label>
                    <textarea
                      value={templateForm.body}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter email body. Use {customerName}, {invoiceNumber}, {totalAmount}, {dueDate} for dynamic content."
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsCreatingTemplate(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateTemplate}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Create Template
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Email Templates List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Email Templates ({emailTemplates.length})
                </h3>
                
                <div className="space-y-4">
                  {emailTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              {template.name}
                            </h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {template.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Subject: {template.subject}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {template.body.substring(0, 150)}...
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedTemplate(template)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Reminder History
            </h3>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4" />
              <p>Reminder history will appear here once reminders are sent.</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};