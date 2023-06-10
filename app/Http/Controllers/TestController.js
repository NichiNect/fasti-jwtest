const TestModel = require('../../Models/TestModel');

class TestController {

    static async index (request, response) {

        const data = TestModel.sayHello();

        return response.status(200)
            .send({
                message: 'Test controller called',
                data
            });
    }
}

module.exports = TestController;
