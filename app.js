const Fastify = require('fastify');
const dotenv = require('dotenv');
const ApiRoutes = require('./routes/api');

dotenv.config();

// * Fastify init
const app = Fastify({
    logger: true
});

// * Registering Route API
app.register(ApiRoutes);

// * Serving http server
app.listen({ port: Number(process.env.PORT ?? 8000) }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Node app running on port ${address}`);
});
