const BaseModel = require('../Base/Model');

class TestModel extends BaseModel {

    sayHello() {

        return 'Hello World!';
    }

    async getUsers() {

        const user = await this.QueryBuilder.select('*').from('users');

        return user;
    }
}

module.exports = new TestModel();
