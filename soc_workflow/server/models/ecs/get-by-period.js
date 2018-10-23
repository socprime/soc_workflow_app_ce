import moment from 'moment';

/**
 * @param server
 * @param req
 * @param index
 * @param dateFrom
 * @param dateTo
 */
module.exports = function (server, req, index, dateFrom, dateTo) {
    return new Promise((resolve, reject) => {
        index = typeof index == 'string' ? index : null;
        try {
            dateFrom = moment(dateFrom);
            dateTo = moment(dateTo);
        } catch (e) {
            dateFrom = null;
            dateTo = null;
        }

        if (index == null || dateFrom == null || dateTo == null) {
            resolve([]);
        }

        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: index,
            body: {
                "size": 10000,
                "query": {
                    "bool": {
                        "must": [{
                            "range": {
                                "@timestamp": {
                                    "gte": dateFrom,
                                    "lte": dateTo
                                }
                            }
                        }]
                    }
                }
            }
        }).then(function (response) {
            response = response['hits']['hits'] || [];
            let data = [];
            response.forEach(function (row) {
                row['_source']['id'] = row['_id'] || '';
                row['_source']['index'] = row['_index'] || '';

                data.push(row['_source']);
            });

            resolve(data);
        }).catch(function (e) {
            resolve([]);
        });
    });
};