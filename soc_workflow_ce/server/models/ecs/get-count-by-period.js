let moment = require('moment-timezone');
const $cf = require('./../../common/function');

/**
 * @param server
 * @param req
 * @param index
 * @param timeField
 * @param dateFrom
 * @param dateTo
 * @returns {Promise}
 */
module.exports = function (server, req, index, timeField, dateFrom, dateTo, terms) {
    return new Promise((resolve, reject) => {
        index = typeof index == 'string' ? index : null;
        timeField = $cf.isString(timeField) ? timeField : "@timestamp";
        try {
            dateFrom = moment(dateFrom, "x").format("x");
            dateTo = moment(dateTo, "x").format("x");
        } catch (e) {
            console.log(e);
            dateFrom = null;
            dateTo = null;
        }

        if (index == null || dateFrom == null || dateTo == null) {
            resolve([]);
        }

        let requestBody = {
            "query": {
                "bool": {
                    "must": []
                }
            }
        };

        let range = {"range": {}};
        range["range"][timeField] = {
            "gte": dateFrom,
            "lte": dateTo
        };
        requestBody["query"]["bool"]["must"].push(range);

        if ($cf.isObject(terms)) {
            for (let term in terms) {
                if ($cf.isString(term) && $cf.isString(terms[term])) {
                    let currTerm = {"term": {}};
                    currTerm["term"][term] = {
                        "value": terms[term]
                    };
                    requestBody["query"]["bool"]["must"].push(currTerm);
                }
            }
        }

        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'count', {
            index: index,
            body: requestBody
        }).then(function (response) {
            resolve(response['count'] || 0);
        }).catch(function (e) {
            console.log(e);
            resolve(0);
        });
    });
};