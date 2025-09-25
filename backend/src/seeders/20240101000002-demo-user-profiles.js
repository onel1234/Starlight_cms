'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('user_profiles', [
      {
        user_id: 1,
        first_name: 'John',
        last_name: 'Director',
        phone: '+1234567890',
        company_name: 'Star Light Constructions',
        position: 'Managing Director'
      },
      {
        user_id: 2,
        first_name: 'Jane',
        last_name: 'Manager',
        phone: '+1234567891',
        company_name: 'Star Light Constructions',
        position: 'Project Manager'
      },
      {
        user_id: 3,
        first_name: 'Bob',
        last_name: 'Surveyor',
        phone: '+1234567892',
        company_name: 'Star Light Constructions',
        position: 'Quantity Surveyor'
      },
      {
        user_id: 4,
        first_name: 'Alice',
        last_name: 'Sales',
        phone: '+1234567893',
        company_name: 'Star Light Constructions',
        position: 'Sales Manager'
      },
      {
        user_id: 5,
        first_name: 'Customer',
        last_name: 'Client',
        phone: '+1234567894',
        company_name: 'ABC Corporation',
        position: 'Procurement Manager'
      },
      {
        user_id: 6,
        first_name: 'Supplier',
        last_name: 'Vendor',
        phone: '+1234567895',
        company_name: 'XYZ Supplies Ltd',
        position: 'Sales Representative'
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_profiles', null, {});
  }
};