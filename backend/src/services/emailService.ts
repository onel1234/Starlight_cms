import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Verify connection configuration
        this.verifyConnection();
    }

    private async verifyConnection(): Promise<void> {
        try {
            await this.transporter.verify();
            logger.info('Email service is ready');
        } catch (error) {
            logger.error('Email service configuration error:', error);
            // In development, we can continue without email service
            if (process.env.NODE_ENV !== 'production') {
                logger.warn('Continuing without email service in development mode');
            }
        }
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const mailOptions = {
                from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent: ${info.messageId}`);
        } catch (error) {
            logger.error('Failed to send email:', error);
            throw new Error('Failed to send email');
        }
    }

    async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification - Star Light Constructions</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Star Light Constructions</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>Thank you for registering with Star Light Constructions Management System. To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Star Light Constructions. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        const text = `
      Welcome to Star Light Constructions!
      
      Hello ${firstName},
      
      Thank you for registering with Star Light Constructions Management System. 
      To complete your registration, please verify your email address by visiting:
      
      ${verificationUrl}
      
      This verification link will expire in 24 hours.
      
      If you didn't create an account with us, please ignore this email.
      
      Best regards,
      Star Light Constructions Team
    `;

        await this.sendEmail({
            to: email,
            subject: 'Verify Your Email Address - Star Light Constructions',
            html,
            text,
        });
    }

    async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - Star Light Constructions</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .warning { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 10px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>We received a request to reset your password for your Star Light Constructions account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <div class="warning">
              <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.
            </div>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Star Light Constructions. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        const text = `
      Password Reset Request - Star Light Constructions
      
      Hello ${firstName},
      
      We received a request to reset your password for your Star Light Constructions account.
      
      To reset your password, please visit:
      ${resetUrl}
      
      This password reset link will expire in 1 hour for security reasons.
      
      If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
      
      Best regards,
      Star Light Constructions Team
    `;

        await this.sendEmail({
            to: email,
            subject: 'Password Reset Request - Star Light Constructions',
            html,
            text,
        });
    }

    async sendWelcomeEmail(email: string, firstName: string, role: string): Promise<void> {
        const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Star Light Constructions</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Star Light Constructions</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>Your email has been verified successfully! Welcome to the Star Light Constructions Management System.</p>
            <p>Your account has been set up with the role: <strong>${role}</strong></p>
            <p>You can now access the system and start managing your construction projects:</p>
            <a href="${loginUrl}" class="button">Login to Your Account</a>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Star Light Constructions. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        await this.sendEmail({
            to: email,
            subject: 'Welcome to Star Light Constructions - Account Verified',
            html,
        });
    }

    async sendProjectCreatedNotification(email: string, firstName: string, projectName: string): Promise<void> {
        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Project Created - Star Light Constructions</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .project-info { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Project Created</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>A new project has been created and you have been assigned to it.</p>
            <div class="project-info">
              <h3>Project: ${projectName}</h3>
              <p>You can now view the project details and start working on assigned tasks.</p>
            </div>
            <a href="${dashboardUrl}" class="button">View Project</a>
            <p>If you have any questions about this project, please contact your project manager.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Star Light Constructions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        await this.sendEmail({
            to: email,
            subject: `New Project Created: ${projectName}`,
            html,
        });
    }

    async sendProjectStatusChangeNotification(
        email: string, 
        firstName: string, 
        projectName: string, 
        newStatus: string
    ): Promise<void> {
        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Project Status Update - Star Light Constructions</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .status-info { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Project Status Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>The status of a project you're involved with has been updated.</p>
            <div class="status-info">
              <h3>Project: ${projectName}</h3>
              <p><strong>New Status:</strong> ${newStatus}</p>
            </div>
            <a href="${dashboardUrl}" class="button">View Project Details</a>
            <p>Please check the project dashboard for more information and any new tasks that may have been assigned.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Star Light Constructions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        await this.sendEmail({
            to: email,
            subject: `Project Status Update: ${projectName} - ${newStatus}`,
            html,
        });
    }

    async sendProjectApprovedNotification(email: string, firstName: string, projectName: string): Promise<void> {
        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Project Approved - Star Light Constructions</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .approval-info { background-color: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Project Approved</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>Great news! Your project has been approved and is now ready to begin.</p>
            <div class="approval-info">
              <h3>Project: ${projectName}</h3>
              <p><strong>Status:</strong> Approved - In Progress</p>
              <p>You can now start working on the project tasks and track progress.</p>
            </div>
            <a href="${dashboardUrl}" class="button">Start Working</a>
            <p>Congratulations on getting your project approved! If you need any assistance, please don't hesitate to reach out.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Star Light Constructions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        await this.sendEmail({
            to: email,
            subject: `Project Approved: ${projectName}`,
            html,
        });
    }

    async sendApprovalRequestNotification(
        email: string, 
        firstName: string, 
        projectName: string, 
        approvalLevel: string,
        budget: number
    ): Promise<void> {
        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard/approvals`;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Project Approval Request - Star Light Constructions</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .approval-request { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .urgent { background-color: #fef2f2; border-left: 4px solid #dc2626; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Project Approval Required</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>A project requires your approval as a ${approvalLevel}.</p>
            <div class="approval-request ${budget > 1000000 ? 'urgent' : ''}">
              <h3>Project: ${projectName}</h3>
              <p><strong>Budget:</strong> $${budget.toLocaleString()}</p>
              <p><strong>Your Role:</strong> ${approvalLevel}</p>
              <p>Please review the project details and provide your approval decision.</p>
            </div>
            <a href="${dashboardUrl}" class="button">Review & Approve</a>
            <p>Please review this request promptly to avoid project delays.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Star Light Constructions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        await this.sendEmail({
            to: email,
            subject: `Approval Required: ${projectName} (${approvalLevel})`,
            html,
        });
    }

    async sendApprovalDecisionNotification(
        email: string,
        firstName: string,
        projectName: string,
        decision: 'Approved' | 'Rejected',
        approvalLevel: string,
        approverName: string,
        comments?: string
    ): Promise<void> {
        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
        const isApproved = decision === 'Approved';

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Project ${decision} - Star Light Constructions</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${isApproved ? '#059669' : '#dc2626'}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: ${isApproved ? '#059669' : '#dc2626'}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .decision-info { background-color: ${isApproved ? '#ecfdf5' : '#fef2f2'}; border-left: 4px solid ${isApproved ? '#059669' : '#dc2626'}; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Project ${decision}</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>An approval decision has been made for your project.</p>
            <div class="decision-info">
              <h3>Project: ${projectName}</h3>
              <p><strong>Decision:</strong> ${decision}</p>
              <p><strong>Approver:</strong> ${approverName} (${approvalLevel})</p>
              ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
            </div>
            <a href="${dashboardUrl}" class="button">View Project</a>
            <p>${isApproved 
              ? 'Your project has been approved and you can proceed with the next steps.' 
              : 'Please review the comments and make necessary adjustments before resubmitting.'
            }</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Star Light Constructions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        await this.sendEmail({
            to: email,
            subject: `Project ${decision}: ${projectName}`,
            html,
        });
    }

    async sendBudgetAlertNotification(
        email: string,
        firstName: string,
        projectName: string,
        budget: number,
        actualCost: number,
        overBudgetAmount: number,
        overBudgetPercentage: number
    ): Promise<void> {
        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Budget Alert - Star Light Constructions</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .alert-info { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          .budget-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .budget-table th, .budget-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .budget-table th { background-color: #f2f2f2; }
          .over-budget { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Budget Alert</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>This is an urgent notification that a project has exceeded its budget.</p>
            <div class="alert-info">
              <h3>Project: ${projectName}</h3>
              <table class="budget-table">
                <tr>
                  <th>Budget Item</th>
                  <th>Amount</th>
                </tr>
                <tr>
                  <td>Original Budget</td>
                  <td>$${budget.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Current Actual Cost</td>
                  <td class="over-budget">$${actualCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Over Budget Amount</td>
                  <td class="over-budget">$${overBudgetAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Over Budget Percentage</td>
                  <td class="over-budget">${overBudgetPercentage.toFixed(1)}%</td>
                </tr>
              </table>
            </div>
            <a href="${dashboardUrl}" class="button">Review Project Budget</a>
            <p><strong>Immediate action required:</strong> Please review the project expenses and take corrective measures to control costs.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Star Light Constructions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        await this.sendEmail({
            to: email,
            subject: `🚨 Budget Alert: ${projectName} - Over Budget by $${overBudgetAmount.toLocaleString()}`,
            html,
        });
    }
}

export const emailService = new EmailService();