let moduleFolder = require('./../../constant/module-folder');
let getStage = require('../../../' + moduleFolder + '/stage_model/server/get-stage');
let $cf = require('./../../common/function');

/**
 * @param server
 * @param req
 * @param currIndex
 * @param dateFrom
 * @param dateTo
 */
module.exports = function (server, req, currIndex, dateFrom, dateTo)
{
    return new Promise((resolve, reject) => {
        currIndex = currIndex || '';
        dateFrom = dateFrom || 0;
        dateTo = dateTo || 0;

        let clientTimezone = req.headers.client_timezone || 0;

        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: currIndex,
            body: {
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
            }
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