let $cf = require('./../../../server/common/function');
let caseEcsGetByIds = require('./../../models/case_ecs/get-by-ids');
let playbookGetByTerms = require('./../../models/playbook/get-by-terms');
let commonGetByTerms = require('./../../models/common/get-by-terms');

let emptyResult = {
    success: false
};

/**
 * @param entity
 * @param addIndex
 * @returns {{ids: Array, data: {}}}
 */
const prepareEventsAlerts = function (entity, addIndex) {
    addIndex = addIndex || false;
    entity = $cf.isArray(entity) ? entity : [];
    let convertedIds = [];
    let convertedData = {};

    entity.forEach(function (tmpId) {
        let index = tmpId.split('/');

        try {
            tmpId = index[(index.length - 1)];

            if (tmpId) {
                convertedIds.push(tmpId);

                convertedData[tmpId] = {};
                convertedData[tmpId]['id'] = tmpId;
                if (addIndex) {
                    convertedData[tmpId]['index'] = index.length > 3 ? (",index:'" + (index[1]) + "'") : '';
                }
            }
        } catch (e) {
        }
    });

    return {
        ids: convertedIds,
        data: convertedData
    };
};

/**
 * @param data
 * @param enrichment
 * @returns {*}
 */
const enrichEventsAlerts = function (data, enrichment) {
    enrichment = ($cf.isArray(enrichment) ? enrichment : []);
    enrichment.forEach(function (doc) {
        if (typeof doc['_id'] != "undefined" && typeof data[doc['_id']] != "undefined") {
            data[doc['_id']]['name'] = typeof doc['_source']['message'] != "undefined" ? doc['_source']['message'] : doc['_id'];
            data[doc['_id']]['created'] = typeof doc['_source']['@timestamp'] != "undefined" ? $cf.getDateInFormat(doc['_source']['@timestamp'], 'YYYY-MM-DD HH:mm:ss', '') : '';
        }
    });

    return data;
};

/**
 * @param server
 * @param req
 * @param id
 */
const getCaseWithEnrichment = function (server, req, id) {
    return new Promise((resolve, reject) => {
        caseEcsGetByIds(server, req, id).then(function (data) {
            data = typeof data[0] == 'object' ? data[0] : {};

            let playbooks = typeof data['playbooks'] == "object" ? data['playbooks'] : [];
            let events = prepareEventsAlerts(data['events.id'], true);
            let alerts = prepareEventsAlerts(data['alerts.id']);

            Promise.all([
                playbookGetByTerms(server, req, {"playbook_name.keyword": playbooks}),
                commonGetByTerms(server, req, '*', '_id', events.ids),
                commonGetByTerms(server, req, 'alerts_ecs-*', '_id', alerts.ids)
            ]).then(function (value) {
                // playbooks
                data['playbooks'] = typeof value[0] == 'string' ? value[0] : "[]";
                // events.id
                data['events.id'] = enrichEventsAlerts(events.data, value[1]);
                // alerts.id
                data['alerts.id'] = enrichEventsAlerts(alerts.data, value[2]);

                resolve(data);
            }).catch (function (e) {
                data['playbooks'] = "[]";
                data['events.id'] = {};
                data['alerts.id'] = {};

                resolve(data);
            });
        });
    });
};

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *=)}}
 */
export default function (server, options) {
    const index = (req, reply) => {
        let id = null;
        if (typeof req.query.id != "undefined") {
            id = req.query.id;
        } else {
            return reply(emptyResult);
        }

        getCaseWithEnrichment(server, req, id).then(function (data) {
            data = typeof data == 'object' ? data : {};

            return reply({
                success: true,
                data: data
            });
        }).catch(function (e) {
            return reply(emptyResult);
        });
    };

    return {
        index: index
    };
};