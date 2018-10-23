/**
 * @param server
 * @param req
 * @param currIndex
 * @param dateFrom
 * @param dateTo
 * @param options
 * @returns {*}
 */
module.exports = function (server, req, currIndex, dateFrom, dateTo, options) {
    server = server || null;
    currIndex = currIndex || null;
    dateFrom = dateFrom || 0;
    dateTo = dateTo || 0;

    options = Object.assign({
        size: 10,
        from: 0,
        orderField: false,
        orderDir: 'asc',
        searchValue: false,
        orderFieldDictionary: {},
        searchFields: [
            'message',
            'operator',
            'event.labels'
        ]
    }, options);

    if (server && currIndex) {
        let queryBody = {
            "size": options.size,
            "from": options.from,
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
        };

        if (options.orderField) {
            queryBody["sort"] = [{}];
            queryBody["sort"][0][options.orderField] = {
                "order": options.orderDir,
                "unmapped_type": "keyword"
            };
        }

        if (options.searchValue) {
            let searchPart = {
                "query_string": {
                    "analyze_wildcard": true,
                    "fields": options.searchFields,
                    "query": ""
                }
            };

            searchPart['query_string']['query'] = '*' + options.searchValue + '*';

            queryBody['query']['bool']['must'].push(searchPart);
        }

        return server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: currIndex,
            body: queryBody
        })
    } else {
        return null;
    }
};