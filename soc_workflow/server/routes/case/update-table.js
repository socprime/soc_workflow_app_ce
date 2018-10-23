import moment from 'moment';

let moduleFolder = require('./../../constant/module_folder');
let $cf = require('./../../common/function');
let getStage = require('../../../' + moduleFolder + '/stage_model/server/get-stage');
let presetColorGlobalSla = require('./../../constant/sla-colors');
let presetColorGlobalPriority = require('./../../constant/priority-colors');
let presetColorGlobal = Object.assign({}, getStage.all, presetColorGlobalSla, presetColorGlobalPriority);

let getSortedOrdered = require('./../../models/ecs/get-sorted-ordered');

let emptyResult = {
    "draw": 1,
    "recordsTotal": 0,
    "recordsFiltered": 0,
    "data": []
};

let orderFieldDictionary = {
    '2': 'event.severity',
    '4': 'message.keyword',
    '5': 'alerts.id',
    '6': 'events.id',
    '7': 'operator.keyword',
    '8': 'event.labels.keyword',
    '9': '@timestamp',
    '10': 'source.ip',
    '11': 'destination.ip',
    '12': 'source.user',
    '13': 'destination.user',
    '14': 'source.hostname',
    '15': 'destination.hostname',
    '16': 'event_data.Image',
};

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *)}}
 */
export default function (server, options) {
    const update = (req, reply) => {
        let dateFrom = moment().subtract(29, 'days');
        if (typeof req.payload['dateFrom'] != "undefined") {
            dateFrom = moment((req.payload['dateFrom'] * 1000)).startOf('day');
        }

        let dateTo = moment();
        if (typeof req.payload['dateTo'] != "undefined") {
            dateTo = moment((req.payload['dateTo'] * 1000)).endOf('day');
        }

        dateFrom = (dateFrom != 'Invalid date') ? dateFrom.format('x') : moment().subtract(29, 'days').startOf('day').format('x');
        dateTo = (dateTo != 'Invalid date') ? dateTo.format('x') : moment().endOf('day').format('x');

        let data = getSortedOrdered(server, req, 'case_ecs-*', dateFrom, dateTo, {
            size: typeof req.payload['length'] != "undefined" ? req.payload['length'] : 10,
            from: typeof req.payload['start'] != "undefined" ? req.payload['start'] : 0,
            orderField: typeof req.payload['order[0][column]'] != "undefined" && typeof orderFieldDictionary[req.payload['order[0][column]']] != "undefined" ? orderFieldDictionary[req.payload['order[0][column]']] : false,
            orderDir: typeof req.payload['order[0][dir]'] != "undefined" && ['asc', 'desc'].indexOf(req.payload['order[0][dir]']) ? req.payload['order[0][dir]'] : 'asc',
            searchValue: typeof req.payload['search[value]'] != "undefined" ? req.payload['search[value]'] : false,
            orderFieldDictionary: orderFieldDictionary,
            searchFields: [
                'message',
                'operator',
                'event.labels',
                'source.ip',
                'destination.ip.keyword',
                'source.user',
                'destination.user',
                'source.hostname',
                'destination.hostname',
                'event_data.Image'
            ]
        });

        if (data) {
            data.then(function (response) {
                // Prepare response
                let result = [];
                let total = response['hits']['total'];

                response['hits']['hits'].forEach(function (doc) {
                    let resData = {};
                    try {
                        resData['id'] = (typeof doc['_id'] != "undefined") ? doc['_id'] : '';
                        resData['event_severity'] = (typeof doc['_source']['event.severity'] != "undefined") ? doc['_source']['event.severity'] : '';
                        resData['event_severity'] = (Object.keys(presetColorGlobalPriority).indexOf(resData['event_severity']) < 0) ? '' : resData['event_severity'];
                        resData['timestamp'] = $cf.getDateInFormat(doc['_source']['@timestamp'], 'YYYY-MM-DD HH:mm:ss.SSS', '');
                        resData['timestamp_utc'] = '';//$cf.getDateInFormat(doc['_source']['@timestamp'], 'YYYY-MM-DD HH:mm:ss.SSS', '', true);
                        resData['alerts'] = (typeof  doc['_source']['alerts.id'] == "object" && doc['_source']['alerts.id'].length > 0) ? doc['_source']['alerts.id'].length : 0;
                        resData['events'] = (typeof  doc['_source']['events.id'] == "object" && doc['_source']['events.id'].length > 0) ? doc['_source']['events.id'].length : 0;
                        resData['operator'] = (typeof doc['_source']['operator'] != "undefined") ? doc['_source']['operator'] : '';
                        resData['event_labels'] = (typeof doc['_source']['event.labels'] != "undefined") ? doc['_source']['event.labels'] : '';
                        resData['message'] = (typeof doc['_source']['message'] != "undefined") ? doc['_source']['message'] : '';
                        resData['tags'] = (typeof  doc['_source']['tags'] != "undefined" && doc['_source']['tags'].length > 0) ? doc['_source']['tags'] : [];
                        resData['priority_color'] = (presetColorGlobal[resData['event_severity']]) ? presetColorGlobal[resData['event_severity']] : 'transparent';
                        resData['source_ip'] = (typeof doc['_source']['source.ip'] != "undefined") ? doc['_source']['source.ip'] : '';
                        resData['destination_ip'] = (typeof doc['_source']['destination.ip'] != "undefined") ? doc['_source']['destination.ip'] : '';
                        resData['source_user'] = (typeof doc['_source']['source.user'] != "undefined") ? doc['_source']['source.user'] : '';
                        resData['destination_user'] = (typeof doc['_source']['destination.user'] != "undefined") ? doc['_source']['destination.user'] : '';
                        resData['source_host'] = (typeof doc['_source']['source.hostname'] != "undefined") ? doc['_source']['source.hostname'] : '';
                        resData['destination_host'] = (typeof doc['_source']['destination.hostname'] != "undefined") ? doc['_source']['destination.hostname'] : '';
                        resData['image'] = (typeof doc['_source']['event_data.Image'] != "undefined") ? doc['_source']['event_data.Image'] : '';

                        let minutesOpened = new Date(doc['_source']['timestamp']);
                        minutesOpened = parseInt((Date.now() - minutesOpened) / 1000 / 60);
                        if (minutesOpened < 10) {
                            resData['sla'] = 'Low';
                        } else if (10 <= minutesOpened < 15) {
                            resData['sla'] = 'Medium';
                        } else {
                            resData['sla'] = 'High';
                        }
                    } catch (e) {
                        resData['id'] = '';
                        resData['event_severity'] = '';
                        resData['timestamp'] = '';
                        resData['alerts'] = 0;
                        resData['events'] = 0;
                        resData['operator'] = '';
                        resData['event_labels'] = '';
                        resData['message'] = '';
                        resData['tags'] = [];
                        resData['priority_color'] = 'transparent';
                        resData['sla'] = 'High';
                        resData['source_ip'] = '';
                        resData['destination_ip'] = '';
                        resData['source_user'] = '';
                        resData['destination_user'] = '';
                        resData['source_host'] = '';
                        resData['destination_host'] = '';
                        resData['image'] = '';
                    }

                    result.push(resData);
                });

                return reply({
                    "recordsTotal": total,
                    "recordsFiltered": total,
                    "data": result
                });
            }).catch(function (e) {
                return reply(emptyResult);
            });
        } else {
            return reply(emptyResult);
        }
    };

    return {
        index: update
    };
};
