const Knex = require('knex');
const { databaseConfig } = require('../../configs/database');

class Model {

    /**
     * Query Builder Property
     */
    QueryBuilder;

    /**
     * Constructor method
     */
    constructor () {
        this.QueryBuilder = Knex(databaseConfig);
    }
}

module.exports = Model;
