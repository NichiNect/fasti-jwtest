/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments();
        table.string('user_dn').unique();
        table.string('username').notNullable().unique();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.text('password');
        table.string('logintype', 10);
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
