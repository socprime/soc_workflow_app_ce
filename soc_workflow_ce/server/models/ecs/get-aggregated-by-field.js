let $cf = require('./../../common/function');

/**
 * @param server
 * @param req
 * @param currIndex
 * @param field
 * @param dateFrom
 * @param dateTo
 * @param colorSet
 */
module.exports = function (server, req, currIndex, field, dateFrom, dateTo, colorSet)
{
    return new Promise((resolve, reject) => {
        currIndex = currIndex || '';
        field = field || '';
        dateFrom = dateFrom || 0;
        dateTo = dateTo || 0;
        colorSet = colorSet || {};

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
                                    "lt": dateTo
                                }
                            }
                        }]
                    }
                },
                "aggs": {
                    "by": {
                        "terms": {
                            "field": field,
                            "size": 50
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
            let resultTmp = {};

            rawData.forEach(function (oneStage) {
                let stageName = typeof oneStage['key'] != "undefined" ? oneStage['key'] : false;
                let stageCount = typeof oneStage['doc_count'] != "undefined" ? oneStage['doc_count'] : false;

                if (stageName && stageCount) {
                    resultTmp[stageName] = stageCount;
                }
            });

            let tmpData = $cf.prepareDonutChartData(resultTmp, colorSet);
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
            console.log(e);
            resolve({
                data: [],
                names: {},
                colors: [],
                total: 0
            });
        });
    });
};