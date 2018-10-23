let $cf = require('./../../common/function');

module.exports = function (server, req, index, ids, field, value) {
    return new Promise((resolve, reject) => {
        index = typeof index == 'string' ? index : null;
        ids = $cf.isArray(ids) ? ids : null;
        field = typeof field == 'string' ? field : null;
        value = typeof value == 'string' ? value : null;

        if (index == null || ids == null || field == null || value == null) {
            resolve(false);
        } else {
            const resp = server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'index', {
                index: index,
                type: '_update_by_query',
                body: {
                    "query": {
                        "ids": {
                            "type": "doc",
                            "values": ids
                        }
                    },
                    "script": {
                        "source": "ctx._source['" + field + "'] = '" + value + "'"
                    }
                }
            }).finally(function () {
                resolve(true);
            }).catch(function (e) {
            });
        }
    });
};