let $cf = require('./../../common/function');

let commonGetByTerms = require('./../../models/common/get-by-terms');

let emptyResult = {
    success: false,
};

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *=)}}
 */
export default function (server, options) {
    const index = (req) => {
        return (async function () {
            return await new Promise(function (reply) {
                let ids = null;
                let isAlerts = typeof req.query.isAlerts != "undefined" ? Boolean(req.query.isAlerts == 'true') : true;

                try {
                    ids = JSON.parse(req.query.ids);
                } catch (e) {
                    console.log(e);
                }

                if (!isAlerts && $cf.isArray(ids)) {
                    let tmpIds = [];
                    ids.forEach(function (row) {
                        if (row) {
                            let split = row.split('/');

                            tmpIds.push(split[(split.length - 1)]);
                        }
                    });

                    ids = tmpIds;
                }

                let fields = {
                    'message': 'message',
                    'event.severity': 'event-severity',
                    'operator': 'operator',
                    'event.labels': 'available-stage',
                    'comment': 'comment',
                    'source.ip': 'source.ip',
                    'destination.ip': 'destination.ip',
                    'device.product': 'device.product',
                };

                // Enrich enabled field list
                let caseEnabledFieldListData = $cf.getCaseEnabledFieldList();
                caseEnabledFieldListData = $cf.isArray(caseEnabledFieldListData) ? caseEnabledFieldListData : [];
                caseEnabledFieldListData.forEach(function (row) {
                    if (typeof row['key'] != "undefined") {
                        fields[row['key']] = row['key'];
                    }
                });

                // Get prev data
                commonGetByTerms(server, req, (isAlerts ? 'alerts_ecs*' : '*'), '_id', ids, 10000).then(function (response) {
                    let prevData = {};

                    response.forEach(function (row) {
                        if (typeof row['_id'] != 'undefined' && typeof row['_source'] != "undefined") {
                            row['_source'] = $cf.makeFlatListFromObject(row['_source']);
                            Object.keys(row['_source']).forEach(function (key) {
                                if (typeof row['_source'][key] != 'undefined' && typeof fields[key] != 'undefined') {
                                    if (typeof prevData[fields[key]] == 'undefined') {
                                        prevData[fields[key]] = [];
                                    }
                                    prevData[fields[key]].push(row['_source'][key]);
                                }
                            });
                        }
                    });

                    let data = {};
                    Object.keys(prevData).forEach(function (key) {
                        let currentArray = prevData[key];
                        if ($cf.isArray(currentArray) && currentArray.length == response.length && currentArray.length) {
                            let first = currentArray[0];
                            let isEqual = currentArray.every(function (currentValue) {
                                return currentValue == first;
                            });

                            if (isEqual) {
                                data[key] = first;
                            }
                        }
                    });

                    return reply({
                        data: data,
                        success: true
                    });
                }).catch(function (e) {
                    console.log(e);
                    return reply(emptyResult);
                });
            });
        })();
    };

    return {
        index: index
    };
};
