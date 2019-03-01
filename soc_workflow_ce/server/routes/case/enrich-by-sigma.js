let moduleFolder = require('./../../constant/module-folder');

let moment = require('moment-timezone');

let cmd = require('node-cmd');
let fs = require('fs');

let $cf = require('./../../common/function');

let commonGetCurrentUser = require('./../../../' + moduleFolder + '/users_model/server/get-current-user');
let commonAddOrUpdate = require('./../../models/common/add-or-update');
let commonGetByBody = require('./../../models/common/get-by-body');
let kibanaGetAllIndexPattern = require('./../../models/kibana/get-all-index-pattern');
let helpersCommonGetAppPath = require('./../../helpers/common/get-app-path');

let emptyResult = {
    success: false
};

let elasticAlias = "es-qs";

/**
 * @param server
 * @param req
 * @param reply
 * @param elasticQuery
 */
let enrichData = function (server, req, reply, elasticQuery) {
    let clientTimezone = req.headers.client_timezone || "UTC";

    let searchIndex = '*';
    let params = {
        caseId: $cf.isString(req.payload.case_id) ? req.payload.case_id : null,
        choosenSigmaName: $cf.isString(req.payload.choosen_sigma_name) ? req.payload.choosen_sigma_name : null,
        dateFrom: $cf.isString(req.payload.daterangepicker_start) ?
            moment(req.payload.daterangepicker_start * 1000, 'x').tz(clientTimezone) : moment().tz(clientTimezone).startOf('day').subtract(7, 'days'),
        dateTo: $cf.isString(req.payload.daterangepicker_end) ?
            moment(req.payload.daterangepicker_end * 1000, 'x').tz(clientTimezone) : moment().tz(clientTimezone).endOf('day'),
    };

    let mustCondition = [{
        "range": {
            "@timestamp": {
                gte: params.dateFrom.format('x'),
                lt: params.dateTo.format('x')
            }
        }
    }, {
        "query_string": {
            "query": elasticQuery
        }
    }];

    Promise.all([
        kibanaGetAllIndexPattern(server, req),
        commonGetCurrentUser(server, req)
    ]).then(function (value) {
        let indexPatterns = value[0] || [];
        let operatorAction = value[1] || [];
        let searchIndexId = '';
        indexPatterns.forEach(function (oneIndex) {
            if ($cf.isString(oneIndex['id']) && $cf.isString(oneIndex['title']) && oneIndex['title'] == searchIndex) {
                searchIndexId = oneIndex['id'];
            }
        });

        if (searchIndexId === false) {
            return reply(emptyResult);
        }

        commonGetByBody(server, req, searchIndex, {
            "size": 100,
            "query": {
                "bool": {
                    "must": mustCondition
                }
            }
        }).then(function (response) {
            response = response['hits'] || [];
            response = response['hits'] || [];

            let ids = [];
            response.forEach(function (doc) {
                try {
                    ids.push(doc['_id']);
                } catch (e) {
                    console.log(e);
                }
            });

            // Write to case log
            let logMessage = '';
            logMessage += 'User Action: Enrich with SIGMA' + '\n';
            if (params.choosenSigmaName) {
                logMessage += params.choosenSigmaName + '\n';
            }
            logMessage += 'Period (UTC) \n';
            logMessage += 'From: ' + params.dateFrom.format('YYYY-MM-DD HH:mm:ss.SSS') + ';\n' + 'To: ' + params.dateTo.format('YYYY-MM-DD HH:mm:ss.SSS') + ';\n';
            logMessage += 'Find <b>' + ids.length + '</b> events\n';
            if (ids.length > 0) {
                let link = false;
                try {
                    link = req.headers.referer.replace('soc_workflow_ce', 'kibana');
                    if (searchIndexId.length > 0) {
                        searchIndexId = ",index:'" + searchIndexId + "'";
                    }

                    // Add time
                    let timeRange = ",time:(from:'" + (params.dateFrom.format('YYYY-MM-DDTHH:mm:ss.SSS')) + "Z',mode:absolute,to:'" + (params.dateTo.format('YYYY-MM-DDTHH:mm:ss.SSS')) + "Z')";

                    ids = ids.join("%22 OR _id:%22", ids);
                    ids = "_id:%22" + ids + "%22";

                    link = link + "#/discover?_g=(refreshInterval:(display:Off,pause:!f,value:0)" + timeRange + ")&_a=(columns:!(_source)" + searchIndexId + ",interval:auto,query:(language:lucene,query:'" + ids + "'),sort:!('@timestamp',desc))";
                    link = '<a href="' + link + '" target="_blank">Events</a>';
                } catch (e) {
                    console.log(e);
                }

                if (link) {
                    logMessage += 'View ' + link + ' in Discover\n';
                }
            }

            let logData = {
                "event_id": params.caseId,
                "@timestamp": parseInt(moment().format('x')),
                "operator.now": '',
                "operator.prev": '',
                "operator.action": operatorAction,
                "stage.now": '',
                "stage.prev": '',
                "comment": logMessage
            };

            let indexDate = moment().tz(clientTimezone).format('YYYY.MM.DD');
            let needIndex = 'case_logs-' + indexDate;
            commonAddOrUpdate(server, req, {
                'index': needIndex,
                'data': logData
            }).then(function (response) {
                return reply({
                    message: logMessage,
                    success: true
                });
            }).catch(function (e) {
                throw e;
            });
        }).catch(function (e) {
            throw e;
        });
    }).catch(function (e) {
        throw e;
    });
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
                let params = {
                    choosenSigma: $cf.isString(req.payload.choosen_sigma) ? req.payload.choosen_sigma : null
                };

                if (!$cf.isString(req.payload.case_id) || !params.choosenSigma) {
                    return reply(emptyResult);
                }

                commonGetByBody(server, req, 'sigma_translation', {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "backend.keyword": elasticAlias
                                    }
                                },
                                {
                                    "term": {
                                        "sigma_doc_id.keyword": params.choosenSigma
                                    }
                                }
                            ]
                        }
                    }
                }).then(function (respTranslation) {
                    respTranslation = respTranslation['hits'] || [];
                    respTranslation = respTranslation['hits'] || [];
                    respTranslation = respTranslation[0] || [];
                    respTranslation = respTranslation['_source'] || [];

                    if (respTranslation['text'] && $cf.isString(respTranslation['text'])) {
                        enrichData(server, req, reply, respTranslation['text']);
                    } else {
                        commonGetByBody(server, req, 'sigma_doc', {
                            "size": 10000,
                            "query": {
                                "term": {
                                    "_id": params.choosenSigma
                                }
                            }
                        }).then(function (respSigma) {
                            respSigma = respSigma['hits'] || [];
                            respSigma = respSigma['hits'] || [];
                            respSigma = respSigma[0] || [];
                            respSigma = respSigma['_source'] || [];

                            if (respSigma['sigma_text'] && $cf.isString(respSigma['sigma_text'])) {
                                let translationScriptPath = helpersCommonGetAppPath(server) + 'server/translation_script';
                                //let translationScriptPath = '/usr/share/kibana/plugins/soc_workflow_ce/server/translation_script';
                                let cmdPromise = new Promise(function (resolve, reject) {
                                    let tmpSigmaFilePath = translationScriptPath + '/sigma/tmp_sigma.txt';
                                    fs.writeFile(tmpSigmaFilePath, respSigma['sigma_text'], 'utf8', function (error) {
                                        if (!error) {
                                            cmd.get(
                                                'python ' + translationScriptPath + '/sigma/sigma_converter.py ' + tmpSigmaFilePath + ' ' + elasticAlias,
                                                function (err, data, stderr) {
                                                    if (!err) {
                                                        resolve(data);
                                                    } else {
                                                        reject(err);
                                                    }
                                                }
                                            );
                                        } else {
                                            reject(error);
                                        }
                                    });
                                });

                                cmdPromise.then(function (result) {
                                    if (result) {
                                        enrichData(server, req, reply, result);
                                    } else {
                                        return reply(emptyResult);
                                    }
                                }).catch(function (e) {
                                    console.log(e);
                                    server.log(['error'], e);
                                    return reply(emptyResult);
                                });
                            } else {
                                return reply(emptyResult);
                            }
                        }).catch(function (e) {
                            console.log(e);
                            return reply(emptyResult);
                        });
                    }
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
