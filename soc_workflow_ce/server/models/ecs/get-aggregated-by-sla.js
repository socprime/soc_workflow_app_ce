import moment from 'moment';
let presetColorGlobalSla = require('./../../constant/sla-colors');
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

        let timeNow = moment().format('x');

        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: currIndex,
            body: {
                "size": "0",
                "query": {
                    "bool": {
                        "must": [{
                            "range": {
                                "@timestamp": {
                                    "gte": dateFrom,
                                    "lt": dateTo
                                }
                            }
                        }]
                    }
                },
                "aggs": {
                    "price_ranges": {
                        "range": {
                            "script": {
                                "lang": "painless",
                                "source": "long now =" + timeNow + "L; (now - doc['@timestamp'].value.getMillis())/1000/60"
                            },
                            "ranges": [
                                {
                                    "to": 10
                                },
                                {
                                    "from": 10,
                                    "to": 15
                                },
                                {
                                    "from": 15
                                }
                            ]
                        }
                    }
                }
            }
        }).then(function (response) {
            let rawData = {};
            let resultTmp = {};

            try {
                rawData = response['aggregations']['price_ranges']['buckets'];
            } catch (e) {
                rawData = [];
            }

            rawData.forEach(function (oneStage) {
                let stageName = false;
                if (typeof oneStage['to'] != "undefined" && oneStage['to'] == 10) {
                    stageName = 'Low';
                }
                if (
                    typeof oneStage['from'] != "undefined" && oneStage['from'] == 10 &&
                    typeof oneStage['to'] != "undefined" && oneStage['to'] == 15
                ) {
                    stageName = 'Medium';
                }
                if (typeof oneStage['from'] != "undefined" && oneStage['from'] == 15) {
                    stageName = 'High';
                }
                let stageCount = typeof oneStage['doc_count'] != "undefined" ? oneStage['doc_count'] : false;

                if (stageName !== false && stageCount) {
                    resultTmp[stageName] = stageCount;
                }
            });

            let tmpData = $cf.prepareDonutChartData(resultTmp, presetColorGlobalSla);
            let data = typeof tmpData['data'] != "undefined" ? tmpData['data'] : [];
            let names = typeof tmpData['names'] != "undefined" ? tmpData['names'] : {};
            let colors = typeof tmpData['colors'] != "undefined" ? tmpData['colors'] : [];
            let total = typeof tmpData['total'] != "undefined" ? tmpData['total'] : 0;

            resolve({
                data: data,
                names: names,
                colors: colors,
                total: total
            });
        }).catch(function (e) {
            resolve({
                data: [],
                names: {},
                colors: [],
                total: 0
            });
        });
    });
}
;