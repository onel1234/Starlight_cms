# Requirements Document

## Introduction

The Construction Management System (CMS) is a comprehensive web application designed specifically for Star Light Constructions, a water, sewerage, and environmental construction company established in 1984. The system will automate manual processes, improve project tracking, enhance customer relationships, and provide robust reporting capabilities. Built with React 18+ TypeScript frontend, Node.js/Express backend, and MySQL 8.0+ database, it will provide a modern, scalable solution for construction business management.

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to manage user accounts with role-based access control, so that different stakeholders can access appropriate system features based on their responsibilities.

#### Acceptance Criteria

1. WHEN a user registers THEN the system SHALL require email verification before account activation
2. WHEN assigning user roles THEN the system SHALL support Director, Project Manager, Quantity Surveyor, Sales Manager, Customer Success Manager, Employee, Customer, and Supplier roles
3. WHEN a user logs in THEN the system SHALL authenticate using JWT tokens and redirect based on their role
4. WHEN a user attempts unauthorized access THEN the system SHALL deny access and log the security event
5. IF a user forgets their password THEN the system SHALL provide secure password reset functionality via email
6. WHEN session expires THEN the system SHALL automatically refresh JWT tokens or require re-authentication

### Requirement 2

**User Story:** As a project manager, I want to create and manage construction projects with detailed specifications, so that I can oversee all project activities from initiation to completion.

#### Acceptance Criteria

1. WHEN creating a project THEN the system SHALL require project name, description, client_id, start_date, end_date, budget, location, and project_type
2. WHEN viewing projects THEN the system SHALL display project status (Planning, In Progress, On Hold, Completed, Closed) with visual indicators
3. WHEN managing project timeline THEN the system SHALL provide Gantt chart visualization with task dependencies
4. WHEN tracking budget THEN the system SHALL display real-time budget vs actual cost comparisons
5. IF a project requires approval THEN the system SHALL implement approval workflow with notifications
6. WHEN a Director closes a project THEN the system SHALL update project status and archive related documents

### Requirement 3

**User Story:** As a team member, I want to create and manage tasks with assignments and progress tracking, so that project work can be organized and monitored effectively.

#### Acceptance Criteria

1. WHEN creating tasks THEN the system SHALL allow assignment to specific users with due dates and priorities
2. WHEN updating task progress THEN the system SHALL track percentage completion and time logging
3. WHEN task dependencies exist THEN the system SHALL prevent dependent tasks from starting until prerequisites are complete
4. WHEN deadlines approach THEN the system SHALL send automated notifications to assigned users
5. IF tasks require approval THEN the system SHALL implement task approval/decline workflow
6. WHEN viewing task lists THEN the system SHALL provide filtering by project, assignee, status, and priority

### Requirement 4

**User Story:** As an inventory manager, I want to track products and stock levels with supplier management, so that materials are available when needed for projects.

#### Acceptance Criteria

1. WHEN managing inventory THEN the system SHALL track stock quantities with low-stock alerts and reorder notifications
2. WHEN adding products THEN the system SHALL support categorization, pricing, specifications, and image galleries
3. WHEN stock levels change THEN the system SHALL log stock movements with timestamps and reasons
4. WHEN managing suppliers THEN the system SHALL track supplier information, performance ratings, and product associations
5. IF stock falls below minimum threshold THEN the system SHALL generate automatic reorder alerts
6. WHEN receiving inventory THEN the system SHALL update stock levels and record supplier delivery information

### Requirement 5

**User Story:** As a quantity surveyor, I want to create dynamic quotations with product selection and pricing, so that accurate project estimates can be provided to clients.

#### Acceptance Criteria

1. WHEN creating quotations THEN the system SHALL provide drag-drop product selection with automatic pricing calculations
2. WHEN building quotations THEN the system SHALL support template-based quotations with tax calculations
3. WHEN finalizing quotations THEN the system SHALL generate PDF documents with company branding
4. WHEN sending quotations THEN the system SHALL provide email delivery with tracking
5. IF quotations require approval THEN the system SHALL implement approval workflow before client delivery
6. WHEN quotations are accepted THEN the system SHALL allow conversion to purchase orders

### Requirement 6

**User Story:** As a procurement manager, I want to manage purchase orders from quotations to delivery, so that supplier relationships and order fulfillment can be tracked effectively.

#### Acceptance Criteria

1. WHEN creating purchase orders THEN the system SHALL generate POs from approved quotations with supplier selection
2. WHEN managing PO workflow THEN the system SHALL track status (Pending, Approved, Delivered, Completed)
3. WHEN tracking deliveries THEN the system SHALL monitor delivery dates and update inventory upon receipt
4. WHEN processing invoices THEN the system SHALL match invoices to purchase orders for validation
5. IF POs require approval THEN the system SHALL implement multi-level approval workflow
6. WHEN payments are due THEN the system SHALL integrate with payment tracking and generate reminders

### Requirement 7

**User Story:** As an accounts manager, I want to generate and track invoices with payment management, so that financial transactions can be monitored and collected efficiently.

#### Acceptance Criteria

1. WHEN generating invoices THEN the system SHALL create invoices automatically from completed purchase orders
2. WHEN managing invoice numbering THEN the system SHALL implement sequential invoice numbering with company prefixes
3. WHEN tracking payments THEN the system SHALL monitor payment status (Paid, Partial, Overdue) with automated reminders
4. WHEN calculating taxes THEN the system SHALL apply appropriate tax rates and generate compliant tax documents
5. IF invoices become overdue THEN the system SHALL send automated payment reminder notifications
6. WHEN payments are received THEN the system SHALL automatically match payments to invoices and update status

### Requirement 8

**User Story:** As a sales manager, I want to manage tender processes from creation to winner selection, so that business opportunities can be pursued systematically.

#### Acceptance Criteria

1. WHEN creating tenders THEN the system SHALL allow detailed tender specifications with submission deadlines
2. WHEN publishing tenders THEN the system SHALL provide public viewing access for external suppliers
3. WHEN receiving applications THEN the system SHALL provide document submission portal with file management
4. WHEN evaluating tenders THEN the system SHALL support scoring systems and evaluation criteria
5. IF tender evaluation is complete THEN the system SHALL facilitate winner selection and notification process
6. WHEN tenders are closed THEN the system SHALL archive tender documents and maintain historical records

### Requirement 9

**User Story:** As a customer success manager, I want to collect and manage customer feedback, so that service quality can be monitored and improved continuously.

#### Acceptance Criteria

1. WHEN customers submit feedback THEN the system SHALL categorize feedback by project and priority level
2. WHEN managing feedback THEN the system SHALL track response status and assign responsibility for follow-up
3. WHEN analyzing feedback THEN the system SHALL provide customer satisfaction metrics and trend analysis
4. WHEN responding to feedback THEN the system SHALL maintain communication history and resolution tracking
5. IF feedback requires urgent attention THEN the system SHALL send immediate notifications to relevant managers
6. WHEN generating reports THEN the system SHALL provide feedback analytics for service improvement initiatives

### Requirement 10

**User Story:** As a director, I want comprehensive reporting and analytics across all business functions, so that informed decisions can be made based on accurate data.

#### Acceptance Criteria

1. WHEN accessing dashboards THEN the system SHALL display real-time metrics for projects, sales, inventory, and finances
2. WHEN generating reports THEN the system SHALL support annual and monthly reports for inventory, sales, projects, and feedback
3. WHEN exporting data THEN the system SHALL provide PDF, Excel, and CSV export formats
4. WHEN scheduling reports THEN the system SHALL allow automated report delivery via email
5. IF custom reports are needed THEN the system SHALL provide dynamic report builder with drill-down capabilities
6. WHEN viewing analytics THEN the system SHALL display interactive charts and graphs with performance indicators

### Requirement 11

**User Story:** As a customer, I want external access to view project progress and submit feedback, so that I can stay informed about my projects and communicate with MegaTECH.

#### Acceptance Criteria

1. WHEN customers log in THEN the system SHALL display their associated projects and current status
2. WHEN viewing project details THEN the system SHALL show timeline, milestones, and progress updates
3. WHEN submitting feedback THEN the system SHALL provide rating systems and comment fields
4. WHEN accessing documents THEN the system SHALL allow viewing of project-related documents with appropriate permissions
5. IF customers need support THEN the system SHALL provide communication channels with project teams
6. WHEN receiving updates THEN the system SHALL send email notifications for important project milestones

### Requirement 12

**User Story:** As a supplier, I want external access to manage quotations and purchase orders, so that I can respond to business opportunities and fulfill orders efficiently.

#### Acceptance Criteria

1. WHEN suppliers log in THEN the system SHALL display available tenders and quotation requests
2. WHEN submitting quotations THEN the system SHALL provide forms for pricing and specification details
3. WHEN managing purchase orders THEN the system SHALL show order status and delivery requirements
4. WHEN updating order status THEN the system SHALL allow suppliers to confirm deliveries and provide tracking information
5. IF payment issues arise THEN the system SHALL provide communication channels with accounts department
6. WHEN viewing history THEN the system SHALL display past orders, payments, and performance metrics