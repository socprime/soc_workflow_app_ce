let $cf = require('./../../common/function');

module.exports = function (server, req, index, ids, field, value, makeValueBulk) {
    return new Promise((resolve, reject) => {
        index = typeof index == 'string' ? index : null;
        ids = $cf.isArray(ids) ? ids : null;
        field = typeof field == 'string' ? field : null;
        value = typeof value == 'string' ? value : null;
        makeValueBulk = makeValueBulk || false;

        if (index == null || ids == null || field == null || value == null) {
            resolve(false);
        } else {
            if (makeValueBulk) field = field.replace(/\./g, "']['");
            const resp = server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'index', {
                index: index,
                type: '_update_by_query',
                refresh: true,
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
                console.log(e);
            });
        }
    });
};