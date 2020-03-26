const moduleFolder = require('./../../constant/module-folder');
let $cf = require('./../../common/function');
const getStage = require(`../../../${moduleFolder}/server/models/stage/get`);

/**
 * @param server
 * @param req
 * @param currIndex
 * @param dateFrom
 * @param dateTo
 * @param defaultValue
 * @returns {Promise}
 */
module.exports = function (server, req, currIndex, dateFrom, dateTo, defaultValue)
{
    return new Promise((resolve, reject) => {
        currIndex = currIndex || '';
        dateFrom = dateFrom || 0;
        dateTo = dateTo || 0;
        defaultValue = defaultValue || false;

        let clientTimezone = req.headers.clienttimezone || 0;

        let requestBody = {
            "size": 0,
            "query": {
                "bool": {
                    "must": [{
                        "range": {
                            "@timestamp": {
                                "gte": dateFrom,
                                "lt": dateTo,
                            }
                        }
                    }]
                }
            },
            "aggs": {
                "by": {
                    "terms": {
                        "field": "event.labels.keyword",
                        "size": 50
                    },
                    "aggs": {
                        "sales_over_time": {
                            "date_histogram": {
                                "field": "@timestamp",
                                "interval": "day",
                                "time_zone": clientTimezone
                            }
                        }
                    }
                }
            }
        };

        if (defaultValue) {
            requestBody["aggs"]["by"]["terms"]["missing"] = defaultValue;
        }

        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: currIndex,
            body: requestBody
        }).then(function (response) {
            let rawData = [];
            try {
                rawData = response['aggregations']['by']['buckets'];
            } catch (e) {
                rawData = [];
            }

            let tmpData = $cf.prepareTimelineChartData(rawData, dateFrom, dateTo, clientTimezone, getStage.all);
            let data = typeof tmpData['data'] != "undefined" ? tmpData['data'] : [];
            let dataGroups = typeof tmpData['dataGroups'] != "undefined" ? tmpData['dataGroups'] : [];
            let colors = typeof tmpData['colors'] != "undefined" ? tmpData['colors'] : [];

            resolve({
                data: data,
                dataGroups: dataGroups,
                colors: colors
            });
        }).catch(function (e) {
            console.log(e);
            resolve({
                data: [],
                dataGroups: [],
                colors: []
            });
        });
    });
}
;