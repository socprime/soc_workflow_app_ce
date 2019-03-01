let $cf = require('./../../common/function');

let alertsEcsGetByIds = require('./../../models/alerts_ecs/get-by-ids');
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
                let alert_ids = null;
                try {
                    alert_ids = JSON.parse(req.query.alert_ids);
                } catch (e) {
                    console.log(e);
                }

                if (alert_ids === null) {
                    return reply(emptyResult);
                }

                alertsEcsGetByIds(server, req, alert_ids).then(function (response) {
                    let alerts = [];
                    response.forEach(function (row) {
                        if (typeof row['message'] != 'undefined') {
                            alerts.push(row['message']);
                        }
                    });

                    let playbooks = $cf.getAvailablePlaybooksNameByAlertNames(server, alerts);

                    commonGetByTerms(server, req, 'playbook', 'playbook_name.keyword', playbooks, 10000).then(function (responsePlaybook) {
                        let data = [];
                        responsePlaybook.forEach(function (docPlaybook) {
                            if (typeof docPlaybook['_id'] != "undefined") {
                                data.push({
                                    "id": docPlaybook['_id'],
                                    "name": (typeof docPlaybook['_source']['playbook_name'] != "undefined" ? docPlaybook['_source']['playbook_name'] : '')
                                });
                            }
                        });

                        return reply({
                            success: true,
                            data: data
                        });
                    }).catch(function (e) {
                        throw e;
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