/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Insert new users
  await knex('users').insert([
    {
      username: 'user1',
      name: 'User 1',
      email: 'user1@mail.com',
      password: 'thispassword',
      logintype: 'LOCAL'
    },
    {
      username: 'user2',
      name: 'User 2',
      email: 'user2@mail.com',
      password: 'thispassword',
      logintype: 'LOCAL'
    },
    {
      username: 'user3',
      name: 'User 3',
      email: 'user3@mail.com',
      password: 'thispassword',
      logintype: 'LDAP'
    },
  ]);
};