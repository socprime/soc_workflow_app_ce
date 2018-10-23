/**
 * @param server
 * @param req
 * @param index
 * @param body
 */
module.exports = function (server, req, index, body) {
    return new Promise((resolve, reject) => {
        index = typeof index == 'string' ? index : '*';
        body = typeof body == 'object' ? body : false;
        if (body === false) {
            resolve(false);
        }

        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: index,
            body: body
        }).then(function (response) {
            resolve(response);
        }).catch(function (e) {
            resolve(false);
        });
    });
};