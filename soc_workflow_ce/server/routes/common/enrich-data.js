const moduleFolder = require('./../../constant/module-folder');

let moment = require('moment-timezone');
let cmd = require('node-cmd');
let $cf = require('./../../common/function');
let kibanaGetCurrentUser = require(`./../../../${moduleFolder}/server/models/kibana/get-current-user`);
let commonAddOrUpdate = require('./../../models/common/add-or-update');

let emptyResult = {
    success: false
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
                let clientTimezone = req.headers.clienttimezone || "UTC";

                let params = {
                    id: typeof req.payload.id == "string" ? req.payload.id : null,
                    type: typeof req.payload.type == "string" && ['case', 'alert'].includes(req.payload.type) ? req.payload.type : null,
                    name: typeof req.payload.name == "string" ? req.payload.name : null,
                    dataName: typeof req.payload.dataName == "string" ? req.payload.dataName : null,
                    dataValue: typeof req.payload.dataValue == "string" ? req.payload.dataValue : null,
                    hideValue: typeof req.payload.hideValue == "boolean" ? req.payload.dataValue : false,
                };
                let enrichCommand = null;

                // Get need command
                let dataEnrichmentSourceConfig = $cf.getConfigFile('data_actions.json');
                let flatConfig = [];
                const getAllConfig = function (subConfig) {
                    if ($cf.isArray(subConfig)) {
                        subConfig.forEach(function (oneRow) {
                            if (
                                $cf.isString(oneRow.name) &&
                                (
                                    $cf.isString(oneRow.link) ||
                                    $cf.isString(oneRow.command)
                                )
                            ) {
                                flatConfig.push(oneRow);
                            } else {
                                for (let subOneRow in oneRow) {
                                    getAllConfig(oneRow[subOneRow]);
                                }
                            }
                        });
                    }
                };

                getAllConfig(dataEnrichmentSourceConfig);

                // Add Custom Enrichment Source
                flatConfig.push({
                    name: 'Upload to Anomali "My Attacks"',
                    command: "/usr/bin/python2.7 -W ignore /opt/scripts/upload_to_anomali_my_attacks.py --alert_body [[value]]"
                });

                flatConfig.forEach(function (source) {
                    if (typeof source.command == 'string' && typeof source.name == 'string' && source.name == params.name) {
                        enrichCommand = source.command;
                    }
                });

                // Return false if error
                if (!params.id || !params.type || !params.name || !params.dataName || !params.dataValue || !enrichCommand) {
                    return reply(emptyResult);
                }

                // Replace value
                //params.dataValue = Buffer.from(params.dataValue).toString('base64');
                enrichCommand = enrichCommand.replace(/\[\[value\]\]/, params.dataValue);

                Promise.all([
                    kibanaGetCurrentUser(server, req),
                    new Promise(function (resolve, reject) {
                        cmd.get(
                            enrichCommand,
                            function (err, data, stderr) {
                                if (!err) {
                                    resolve(data);
                                } else {
                                    reject(err);
                                }
                            }
                        );

                        setTimeout(() => {
                            reject(new Error("Timeout error"));
                        }, 120000);
                    })
                ]).then(function (value) {
                    let operatorAction = value[0] || '';
                    let commandResult = value[1] || '';

                    let logMessage = '';
                    logMessage += 'User Action: ' + params.name + '\n';
                    if (!params.hideValue) {
                        logMessage += params.dataName + ' = ' + params.dataValue + '\n';
                    }
                    logMessage += 'Result:\n' + commandResult;

                    let logData = {
                        "event_id": params.id,
                        "@timestamp": parseInt(moment().format('x')),
                        "operator.now": '',
                        "operator.prev": '',
                        "operator.action": operatorAction,
                        "stage.now": '',
                        "stage.prev": '',
                        "comment": logMessage
                    };

                    let indexDate = moment().tz(clientTimezone).format('YYYY.MM');
                    let needIndex = (params.type == 'case') ? 'case_logs-' + indexDate : 'alerts_logs-' + indexDate;
                    commonAddOrUpdate(server, req, {
                        'index': needIndex,
                        'data': logData
                    }).then(function (response) {
                        return reply({
                            success: true,
                            message: logMessage,
                            index: needIndex
                        });
                    }).catch(function (e) {
                        throw e;
                    });
                }).catch(function (e) {
                    console.log(e);
                    if (typeof e.message == 'string') {
                        emptyResult.message = e.message;
                    }

                    return reply(emptyResult);
                });
            });
        })();
    };

    return {
        index: index
    };
};
