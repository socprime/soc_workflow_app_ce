let $cf = require('./../../common/function');

/**
 * @param server
 * @param req
 * @param options
 */
module.exports = function (server, req, options) {
    options = Object.assign({
        'index': null,
        'data': {},
        'id': null,
        'schema': {},
        'required': [],
    }, options);

    options.required = $cf.isArray(options.required) ? options.required : [];
    options.schema = typeof options.schema == 'object' ? options.schema : {};
    options.data = typeof options.data == 'object' ? options.data : {};

    options.data = Object.assign(options.schema, options.data);

    return new Promise((resolve, reject) => {
        let allOk = true;
        options.required.forEach(function (field) {
            if (typeof options.data[field] == 'undefined') {
                allOk = false;
            }
        });

        if (allOk == false || typeof options.index != 'string') {
            resolve(false);
        }

        let request = {
            index: options.index,
            type: 'doc',
            body: options.data
        };

        // If set id update
        if (typeof options.id == 'string') {
            request['id'] = options.id;
        }

        let resp = server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'index', request).then(function (resp) {
            resolve(resp);
        }).catch(function (e) {
            resolve(false);
        });
    });
};