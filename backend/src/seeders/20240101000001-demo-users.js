'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 12);

    await queryInterface.bulkInsert('users', [
      {
        email: 'director@starlightconstructions.com',
        password_hash: hashedPassword,
        role: 'Director',
        status: 'Active',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'pm@starlightconstructions.com',
        password_hash: hashedPassword,
        role: 'Project Manager',
        status: 'Active',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'qs@starlightconstructions.com',
        password_hash: hashedPassword,
        role: 'Quantity Surveyor',
        status: 'Active',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'sales@starlightconstructions.com',
        password_hash: hashedPassword,
        role: 'Sales Manager',
        status: 'Active',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'customer@example.com',
        password_hash: hashedPassword,
        role: 'Customer',
        status: 'Active',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'supplier@example.com',
        password_hash: hashedPassword,
        role: 'Supplier',
        status: 'Active',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};