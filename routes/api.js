const TestController = require('../app/Http/Controllers/TestController');

module.exports = async (app) => {
    app.get('/', TestController.index);
}
