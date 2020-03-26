let $cf = require('./../../common/function');

module.exports = function (server, req, index, body) {
    return new Promise((resolve, reject) => {
        index = typeof index == 'string' ? index : null;
        body = $cf.isObject(body) ? body : null;

        if (index == null || body == null) {
            resolve(false);
        } else {
            const resp = server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'transport.request', {
                method: 'POST',
                path: index + '/_update_by_query?refresh=true',
                body: body
            }).finally(function () {
                resolve(true);
            }).catch(function (e) {
                console.log(e);
            });
        }
    });
};