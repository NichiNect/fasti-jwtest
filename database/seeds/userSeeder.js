const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  const salt = bcrypt.genSaltSync(10);

  // Insert new users
  await knex('users').insert([
    {
      username: 'user1',
      name: 'User 1',
      email: 'user1@mail.com',
      password: bcrypt.hashSync('thispassword', salt),
      logintype: 'LOCAL'
    },
    {
      username: 'user2',
      name: 'User 2',
      email: 'user2@mail.com',
      password: bcrypt.hashSync('thispassword', salt),
      logintype: 'LOCAL'
    },
    {
      user_dn: 'uid=riemann',
      username: 'riemann',
      name: 'Bernhard Riemann',
      email: 'riemann@ldap.forumsys.com',
      // password: bcrypt.hashSync('thispassword', salt),
      logintype: 'LDAP'
    },
  ]);
};
