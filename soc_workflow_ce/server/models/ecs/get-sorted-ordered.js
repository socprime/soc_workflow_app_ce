let $cf = require('./../../common/function');

/**
 * @param server
 * @param req
 * @param currIndex
 * @param timeField
 * @param dateFrom
 * @param dateTo
 * @param options
 * @returns {*}
 */
module.exports = function (server, req, currIndex, timeField, dateFrom, dateTo, options) {
    server = server || null;
    currIndex = currIndex || null;
    timeField = $cf.isString(timeField) ? timeField : '@timestamp';
    dateFrom = dateFrom || 0;
    dateTo = dateTo || 0;

    options = Object.assign({
        size: 10,
        from: 0,
        orderField: false,
        orderDir: 'asc',
        searchValue: false,
        searchFields: [
            'message',
            'operator',
            'event.labels'
        ],
        additionalTerms: false
    }, options);

    if (server && currIndex) {
        let timeMust = {"range":{}};
        timeMust['range'][timeField] = {
            "gte": dateFrom,
            "lte": dateTo
        };

        let queryBody = {
            "size": options.size,
            "from": options.from,
            "query": {
                "bool": {
                    "must": []
                }
            }
        };

        queryBody["query"]["bool"]["must"].push(timeMust);

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
                    "lenient": true,
                    "fields": options.searchFields,
                    "query": ""
                }
            };

            searchPart['query_string']['query'] = '*' + options.searchValue + '*';

            queryBody['query']['bool']['must'].push(searchPart);
        }

        if ($cf.isObject(options.additionalTerms)) {
            for (let termKey in options.additionalTerms) {
                if ($cf.isString(termKey) && $cf.isString(options.additionalTerms[termKey])) {
                    let currTerm = {"term": {}};
                    currTerm["term"][termKey] = {
                        "value": options.additionalTerms[termKey]
                    };
                    queryBody['query']['bool']['must'].push(currTerm);
                }
            }
        }

        return server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: currIndex,
            body: queryBody
        });
    } else {
        return new Promise(function (resolve, reject) {
            reject('Error! Empty server or currIndex params in "server/models/ecs/get-sorted-ordered.js"');
        });
    }
};