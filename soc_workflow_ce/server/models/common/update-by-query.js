let $cf = require('./../../common/function');

module.exports = function (server, req, index, ids, query) {
    return new Promise((resolve, reject) => {
        index = typeof index == 'string' ? index : null;
        ids = $cf.isArray(ids) ? ids : null;
        query = $cf.isString(query) ? query : null;

        if (index == null || ids == null || query == null) {
            resolve(false);
        } else {
            const resp = server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'transport.request', {
                method: 'POST',
                path: index + '/_update_by_query?refresh=true',
                body: {
                    "query": {
                        "ids": {
                            "type": "_doc",
                            "values": ids
                        }
                    },
                    "script": {
                        "source": query
                    }
                }
            }).finally(function () {
                resolve(true);
            }).catch(function (e) {
                console.log(e);
            });
        }
    });
};