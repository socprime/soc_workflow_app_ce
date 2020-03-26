const $cf = require('./../../common/function');

/**
 * @param server
 * @param req
 * @param index
 * @param body
 * @returns {Promise}
 */
module.exports = function (server, req, index, body) {
    return new Promise((resolve, reject) => {
        index = typeof index == 'string' ? index : null;
        body = $cf.isObject(body) ? body : {};

        if (index == null) {
            resolve(0);
        }

        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'count', {
            index: index,
            body: body
        }).then(function (response) {
            resolve(response['count'] || 0);
        }).catch(function (e) {
            console.log(e);
            resolve(0);
        });
    });
};