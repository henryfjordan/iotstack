var shema = require('js-schema');

// Get list of devices
var devices = require('../devices');

module.exports = [
    {
        /* Return a list of all devices */
        method: 'GET',
        path: '/device',
        handler: function(request, reply) {

            var r = request.server.plugins['hapi-rethinkdb'].rethinkdb;
            var localhost = request.server.plugins['hapi-rethinkdb'].connection;

            r.table('devices')
            .run(localhost, function(err, cursor) {
                if (err) throw err;
                cursor.toArray(function(err, result) {
                    if (err) throw err;
                    reply(JSON.stringify(result, null, 2));
                });
            });

        }
    },
    {
        /* Return a list of all devices of a type */
        method: 'GET',
        path: '/device/{type}',
        handler: function (request, reply) {

            var r = request.server.plugins['hapi-rethinkdb'].rethinkdb;
            var localhost = request.server.plugins['hapi-rethinkdb'].connection

            r.db('iotservice').table('devices')
            .filter({type: request.params.type})
            .run(localhost, function(err, cursor) {
                if (err) reply(err);
                cursor.toArray(function(err, result) {
                    if (err) reply(err);
                    reply(JSON.stringify(result, null, 2));
                });
            });

        }
    },
    {
        /* Return a specific device */
        method: 'GET',
        path: '/device/{type}/{name}',
        handler: function (request, reply) {

            var r = request.server.plugins['hapi-rethinkdb'].rethinkdb;
            var localhost = request.server.plugins['hapi-rethinkdb'].connection

            r.db('iotservice').table('devices')
            .get(request.params.name)
            .run(localhost, function(err, cursor) {
                if (err) reply(err);
                if (cursor) {
                    reply(cursor);
                } else {
                    reply("Not Found").code(404);
                }
            });
        }
    },
    {
        /* Update a specific device */
        method: 'POST',
        path: '/device/{device}/{name}',
        handler: function (request, reply) {

            var r = request.server.plugins['hapi-rethinkdb'].rethinkdb;
            var localhost = request.server.plugins['hapi-rethinkdb'].connection

            // Return bad request if payload doesn't validate
            if (!devices[request.params.device].schema(request.payload)) {
                reply("Bad Payload").code(400);
                return;
            }

            r.db('iotservice').table('devices')
            .filter({name: request.params.name})
            .update({
                state: request.payload,
                last_updated: r.now()
            })
            .run(localhost, function(err, cursor) {
                if (err) reply(err);
                reply(cursor);
            });

        }
    }
];
