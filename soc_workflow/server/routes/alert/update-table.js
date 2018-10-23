import moment from 'moment';

let $cf = require('./../../common/function');
let moduleFolder = require('./../../constant/module_folder');
let getStage = require('../../../' + moduleFolder + '/stage_model/server/get-stage');
let presetColorGlobalSla = require('./../../constant/sla-colors');
let presetColorGlobalPriority = require('./../../constant/priority-colors');

let presetColorGlobal = Object.assign({}, getStage.all, presetColorGlobalSla, presetColorGlobalPriority);

let ecsGetSortedOrdered = require('./../../models/ecs/get-sorted-ordered');

let emptyResult = {
    "draw": 1,
    "recordsTotal": 0,
    "recordsFiltered": 0,
    "data": []
};

let orderFieldDictionary = {
    '2': 'event.severity',
    '4': '@timestamp',
    '5': '@timestamp',
    '6': 'message.keyword',
    '7': 'source.ip',
    '8': 'destination.ip',
    '9': 'source.user',
    '10': 'destination.user',
    '11': 'source.hostname',
    '12': 'destination.hostname',
    '13': 'event_data.Image',
    '14': 'event.labels.keyword',
    '15': 'device.product',
};

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *=)}}
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

        let data = ecsGetSortedOrdered(server, req, 'alerts_ecs-*', dateFrom, dateTo, {
            size: typeof req.payload['length'] != "undefined" ? req.payload['length'] : 10,
            from: typeof req.payload['start'] != "undefined" ? req.payload['start'] : 0,
            orderField: typeof req.payload['order[0][column]'] != "undefined" && typeof orderFieldDictionary[req.payload['order[0][column]']] != "undefined" ? orderFieldDictionary[req.payload['order[0][column]']] : false,
            orderDir: typeof req.payload['order[0][dir]'] != "undefined" && ['asc', 'desc'].indexOf(req.payload['order[0][dir]']) ? req.payload['order[0][dir]'] : 'asc',
            searchValue: typeof req.payload['search[value]'] != "undefined" ? req.payload['search[value]'] : false,
            orderFieldDictionary: orderFieldDictionary,
            searchFields: [
                'message',
                'source.ip',
                'destination.ip.keyword',
                'source.user',
                'destination.user',
                'source.hostname',
                'destination.hostname',
                'event_data.Image',
                'event.labels',
                'device.product'
            ]
        });

        if (data) {
            data.then(function (response) {
                // Prepare response
                let result = [];
                let total = response['hits']['total'];

                response['hits']['hits'].forEach(function (doc) {
                    try {
                        let resData = {};

                        resData['id'] = (typeof doc['_id'] != "undefined") ? doc['_id'] : '';
                        resData['event_severity'] = (typeof doc['_source']['event.severity'] != "undefined") ? doc['_source']['event.severity'] : '';
                        resData['timestamp'] = $cf.getDateInFormat(doc['_source']['@timestamp'], 'YYYY-MM-DD HH:mm:ss.SSS', '');
                        resData['timestamp_utc'] = $cf.getDateInFormat(doc['_source']['@timestamp'], 'YYYY-MM-DD HH:mm:ss.SSS', '', true);
                        resData['device_vendor'] = (typeof doc['_source']['device.vendor'] != "undefined") ? doc['_source']['device.vendor'] : '';
                        resData['device_product'] = (typeof doc['_source']['device.product'] != "undefined") ? doc['_source']['device.product'] : '';
                        resData['source_ip'] = (typeof doc['_source']['source.ip'] != "undefined") ? doc['_source']['source.ip'] : '';
                        resData['destination_ip'] = (typeof doc['_source']['destination.ip'] != "undefined") ? doc['_source']['destination.ip'] : '';
                        resData['source_user'] = (typeof doc['_source']['source.user'] != "undefined") ? doc['_source']['source.user'] : '';
                        resData['destination_user'] = (typeof doc['_source']['destination.user'] != "undefined") ? doc['_source']['destination.user'] : '';
                        resData['source_host'] = (typeof doc['_source']['source.hostname'] != "undefined") ? doc['_source']['source.hostname'] : '';
                        resData['destination_host'] = (typeof doc['_source']['destination.hostname'] != "undefined") ? doc['_source']['destination.hostname'] : '';
                        resData['image'] = (typeof doc['_source']['event_data.Image'] != "undefined") ? doc['_source']['event_data.Image'] : '';
                        resData['event_labels'] = (typeof doc['_source']['event.labels'] != "undefined") ? doc['_source']['event.labels'] : '';
                        resData['message'] = (typeof doc['_source']['message'] != "undefined") ? doc['_source']['message'] : '';

                        let availableEventSeverity = Object.keys(presetColorGlobalPriority);
                        if (availableEventSeverity.indexOf(resData['event_severity']) < 0) {
                            resData['event_severity'] = '';
                        }

                        if (presetColorGlobal[resData['event_severity']]) {
                            resData['priority_color'] = presetColorGlobal[resData['event_severity']];
                        } else {
                            resData['priority_color'] = 'transparent';
                        }

                        result.push(resData);
                    } catch (e) {
                        result.push({
                            'id': '',
                            'event_severity': '',
                            'timestamp': '',
                            'device_vendor': '',
                            'device_product': '',
                            'source_ip': '',
                            'destination_ip': '',
                            'source_user': '',
                            'destination_user': '',
                            'source_host': '',
                            'destination_host': '',
                            'image': '',
                            'event_labels': '',
                            'message': '',
                        });
                    }
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
