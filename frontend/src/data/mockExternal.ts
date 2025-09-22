import { 
  CustomerProject, 
  SupplierTender, 
  SupplierQuotation, 
  SupplierOrder, 
  ExternalMessage,
  MessageThread 
} from '../types/external'

export const mockCustomerProjects: CustomerProject[] = [
  {
    id: 1,
    name: 'Water Treatment Plant - Phase 1',
    description: 'Construction of primary water treatment facility with capacity of 50,000 gallons per day',
    status: 'In Progress',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-08-30'),
    budget: 2500000,
    actualCost: 1200000,
    location: 'Industrial District, City Center',
    projectType: 'Water Treatment',
    progress: 48,
    milestones: [
      {
        id: 1,
        projectId: 1,
        title: 'Site Preparation Complete',
        description: 'Land clearing and foundation preparation',
        dueDate: new Date('2024-02-28'),
        completedDate: new Date('2024-02-25'),
        status: 'Completed',
        progress: 100
      },
      {
        id: 2,
        projectId: 1,
        title: 'Foundation Construction',
        description: 'Concrete foundation and structural base',
        dueDate: new Date('2024-04-15'),
        completedDate: new Date('2024-04-12'),
        status: 'Completed',
        progress: 100
      },
      {
        id: 3,
        projectId: 1,
        title: 'Equipment Installation',
        description: 'Primary treatment equipment installation',
        dueDate: new Date('2024-06-30'),
        status: 'In Progress',
        progress: 65
      },
      {
        id: 4,
        projectId: 1,
        title: 'System Testing',
        description: 'Comprehensive system testing and commissioning',
        dueDate: new Date('2024-08-15'),
        status: 'Pending',
        progress: 0
      }
    ],
    documents: [
      {
        id: 1,
        projectId: 1,
        name: 'Project Contract.pdf',
        type: 'application/pdf',
        url: '/documents/contract-001.pdf',
        uploadedAt: new Date('2024-01-10'),
        size: 2048576,
        category: 'Contract'
      },
      {
        id: 2,
        projectId: 1,
        name: 'Technical Drawings.dwg',
        type: 'application/dwg',
        url: '/documents/drawings-001.dwg',
        uploadedAt: new Date('2024-01-12'),
        size: 5242880,
        category: 'Drawing'
      },
      {
        id: 3,
        projectId: 1,
        name: 'Progress Report - March.pdf',
        type: 'application/pdf',
        url: '/documents/progress-march.pdf',
        uploadedAt: new Date('2024-03-31'),
        size: 1048576,
        category: 'Report'
      }
    ],
    timeline: [
      {
        id: 1,
        projectId: 1,
        title: 'Project Kickoff Meeting',
        description: 'Initial project meeting with all stakeholders',
        date: new Date('2024-01-15'),
        type: 'meeting',
        status: 'completed'
      },
      {
        id: 2,
        projectId: 1,
        title: 'Site Preparation Completed',
        description: 'Land clearing and preparation work finished',
        date: new Date('2024-02-25'),
        type: 'milestone',
        status: 'completed'
      },
      {
        id: 3,
        projectId: 1,
        title: 'Equipment Delivery',
        description: 'Primary treatment equipment delivered to site',
        date: new Date('2024-05-15'),
        type: 'delivery',
        status: 'completed'
      },
      {
        id: 4,
        projectId: 1,
        title: 'Monthly Progress Review',
        description: 'Scheduled progress review meeting',
        date: new Date('2024-06-15'),
        type: 'meeting',
        status: 'upcoming'
      }
    ]
  },
  {
    id: 2,
    name: 'Sewerage System Upgrade',
    description: 'Upgrade of existing sewerage infrastructure for residential area',
    status: 'Planning',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-12-31'),
    budget: 1800000,
    actualCost: 0,
    location: 'Residential Area, North District',
    projectType: 'Sewerage',
    progress: 15,
    milestones: [
      {
        id: 5,
        projectId: 2,
        title: 'Environmental Impact Assessment',
        description: 'Complete environmental impact study',
        dueDate: new Date('2024-06-15'),
        status: 'In Progress',
        progress: 80
      },
      {
        id: 6,
        projectId: 2,
        title: 'Permits and Approvals',
        description: 'Obtain all necessary permits and approvals',
        dueDate: new Date('2024-06-30'),
        status: 'Pending',
        progress: 0
      }
    ],
    documents: [
      {
        id: 4,
        projectId: 2,
        name: 'Preliminary Design.pdf',
        type: 'application/pdf',
        url: '/documents/prelim-design-002.pdf',
        uploadedAt: new Date('2024-05-20'),
        size: 3145728,
        category: 'Drawing'
      }
    ],
    timeline: [
      {
        id: 5,
        projectId: 2,
        title: 'Initial Site Survey',
        description: 'Comprehensive site survey and assessment',
        date: new Date('2024-05-10'),
        type: 'milestone',
        status: 'completed'
      },
      {
        id: 6,
        projectId: 2,
        title: 'Design Review Meeting',
        description: 'Review preliminary design with stakeholders',
        date: new Date('2024-06-20'),
        type: 'meeting',
        status: 'upcoming'
      }
    ]
  }
]

export const mockSupplierTenders: SupplierTender[] = [
  {
    id: 1,
    title: 'Water Pumps and Filtration Equipment',
    description: 'Supply of high-capacity water pumps and advanced filtration systems for water treatment facility',
    category: 'Equipment',
    submissionDeadline: new Date('2024-07-15'),
    status: 'Open',
    requirements: [
      'ISO 9001 certified manufacturing',
      'Minimum 5-year warranty on all equipment',
      'Local service and maintenance support',
      'Compliance with national water quality standards'
    ],
    documents: [
      {
        id: 1,
        tenderId: 1,
        name: 'Technical Specifications.pdf',
        type: 'application/pdf',
        url: '/tenders/tech-specs-001.pdf',
        required: true,
        description: 'Detailed technical requirements and specifications'
      },
      {
        id: 2,
        tenderId: 1,
        name: 'Tender Form.docx',
        type: 'application/docx',
        url: '/tenders/tender-form-001.docx',
        required: true,
        description: 'Official tender submission form'
      }
    ],
    estimatedValue: 850000,
    contactPerson: 'John Smith',
    contactEmail: 'john.smith@starlightconstructions.com'
  },
  {
    id: 2,
    title: 'Construction Materials - Concrete and Steel',
    description: 'Supply of high-grade concrete and reinforcement steel for infrastructure projects',
    category: 'Materials',
    submissionDeadline: new Date('2024-06-30'),
    status: 'Open',
    requirements: [
      'Grade 40 concrete minimum',
      'Certified steel reinforcement bars',
      'Delivery within 48 hours of order',
      'Quality certificates for all materials'
    ],
    documents: [
      {
        id: 3,
        tenderId: 2,
        name: 'Material Specifications.pdf',
        type: 'application/pdf',
        url: '/tenders/material-specs-002.pdf',
        required: true,
        description: 'Material quality and quantity requirements'
      }
    ],
    estimatedValue: 450000,
    contactPerson: 'Sarah Johnson',
    contactEmail: 'sarah.johnson@starlightconstructions.com'
  }
]

export const mockSupplierQuotations: SupplierQuotation[] = [
  {
    id: 1,
    tenderId: 1,
    supplierId: 101,
    quotationNumber: 'QUO-2024-001',
    totalAmount: 825000,
    validUntil: new Date('2024-08-15'),
    status: 'Submitted',
    submittedAt: new Date('2024-06-10'),
    items: [
      {
        id: 1,
        productName: 'High-Capacity Water Pump - Model WP500',
        description: '500 GPM centrifugal pump with variable speed drive',
        quantity: 4,
        unitPrice: 125000,
        totalPrice: 500000,
        specifications: 'Stainless steel construction, 50HP motor, 5-year warranty'
      },
      {
        id: 2,
        productName: 'Advanced Filtration System - Model AF200',
        description: 'Multi-stage filtration with automated backwash',
        quantity: 2,
        unitPrice: 150000,
        totalPrice: 300000,
        specifications: 'Carbon and sand filtration, PLC control system'
      },
      {
        id: 3,
        productName: 'Installation and Commissioning',
        description: 'Professional installation and system commissioning',
        quantity: 1,
        unitPrice: 25000,
        totalPrice: 25000,
        specifications: 'Includes training and 1-year maintenance'
      }
    ],
    notes: 'All equipment includes 5-year comprehensive warranty and local service support'
  }
]

export const mockSupplierOrders: SupplierOrder[] = [
  {
    id: 1,
    orderNumber: 'PO-2024-0156',
    supplierId: 101,
    totalAmount: 825000,
    status: 'In Production',
    orderDate: new Date('2024-05-15'),
    expectedDeliveryDate: new Date('2024-07-30'),
    deliveryAddress: 'Star Light Constructions Warehouse, 123 Industrial Ave, City Center',
    trackingNumber: 'SLC-TRACK-789456',
    items: [
      {
        id: 1,
        productName: 'High-Capacity Water Pump - Model WP500',
        quantity: 4,
        unitPrice: 125000,
        totalPrice: 500000,
        status: 'In Production'
      },
      {
        id: 2,
        productName: 'Advanced Filtration System - Model AF200',
        quantity: 2,
        unitPrice: 150000,
        totalPrice: 300000,
        status: 'In Production'
      },
      {
        id: 3,
        productName: 'Installation and Commissioning',
        quantity: 1,
        unitPrice: 25000,
        totalPrice: 25000,
        status: 'Pending'
      }
    ],
    notes: 'Priority order - expedited production requested'
  },
  {
    id: 2,
    orderNumber: 'PO-2024-0142',
    supplierId: 101,
    totalAmount: 156000,
    status: 'Delivered',
    orderDate: new Date('2024-03-20'),
    expectedDeliveryDate: new Date('2024-04-15'),
    actualDeliveryDate: new Date('2024-04-12'),
    deliveryAddress: 'Project Site - Water Treatment Plant, Industrial District',
    trackingNumber: 'SLC-TRACK-654321',
    items: [
      {
        id: 4,
        productName: 'Pipe Fittings - Stainless Steel',
        quantity: 50,
        unitPrice: 2800,
        totalPrice: 140000,
        status: 'Delivered'
      },
      {
        id: 5,
        productName: 'Valve Assembly - 6 inch',
        quantity: 8,
        unitPrice: 2000,
        totalPrice: 16000,
        status: 'Delivered'
      }
    ],
    notes: 'Delivery completed successfully - all items inspected and approved'
  }
]

export const mockExternalMessages: ExternalMessage[] = [
  {
    id: 1,
    senderId: 1, // Customer
    receiverId: 2, // Project Manager
    subject: 'Question about Project Timeline',
    content: 'Hi, I wanted to check on the current status of the equipment installation milestone. The dashboard shows 65% progress, but I\'d like to understand what specific tasks are remaining.',
    sentAt: new Date('2024-06-10T10:30:00'),
    readAt: new Date('2024-06-10T14:15:00'),
    threadId: 1,
    type: 'inquiry'
  },
  {
    id: 2,
    senderId: 2, // Project Manager
    receiverId: 1, // Customer
    subject: 'Re: Question about Project Timeline',
    content: 'Thank you for your inquiry. The equipment installation is progressing well. We have completed the pump installation and are currently working on the filtration system connections. The remaining tasks include electrical connections (estimated 2 weeks) and system testing (1 week). We expect to complete this milestone by June 30th as scheduled.',
    sentAt: new Date('2024-06-10T16:45:00'),
    readAt: new Date('2024-06-11T08:20:00'),
    threadId: 1,
    type: 'update'
  },
  {
    id: 3,
    senderId: 101, // Supplier
    receiverId: 3, // Procurement Manager
    subject: 'Delivery Update - PO-2024-0156',
    content: 'We wanted to provide an update on your order PO-2024-0156. The water pumps are currently in final quality testing and will be ready for shipment by July 20th. The filtration systems are on schedule for July 25th completion. We will provide tracking information once items are shipped.',
    sentAt: new Date('2024-06-12T09:15:00'),
    threadId: 2,
    type: 'update'
  }
]

export const mockMessageThreads: MessageThread[] = [
  {
    id: 1,
    subject: 'Project Timeline Discussion',
    participants: [1, 2], // Customer and Project Manager
    lastMessageAt: new Date('2024-06-11T08:20:00'),
    unreadCount: 0,
    messages: [
      mockExternalMessages[0],
      mockExternalMessages[1]
    ]
  },
  {
    id: 2,
    subject: 'Order Delivery Updates',
    participants: [101, 3], // Supplier and Procurement Manager
    lastMessageAt: new Date('2024-06-12T09:15:00'),
    unreadCount: 1,
    messages: [
      mockExternalMessages[2]
    ]
  }
]