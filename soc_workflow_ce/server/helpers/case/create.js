import moment from 'moment';

let $cf = require('./../../common/function');

/**
 * @type {{validateInput: module.exports.validateInput, identifyCurrentIndexPattern: module.exports.identifyCurrentIndexPattern}}
 */
module.exports = {
    validateInput: function (req, idType) {
        let data = {};
        let fields = {
            'message': 'message',
            'event-severity': 'event.severity',
            'operator': 'operator',
            'available-stage': 'event.labels',
            'comment': 'comment',
            'source-ip': 'source.ip',
            'destination-ip': 'destination.ip',
            'device-product': 'device.product',
            'playbooks': 'playbooks',
        };

        let caseEnabledFieldListData = $cf.getCaseEnabledFieldList();

        if (caseEnabledFieldListData.length) {
            caseEnabledFieldListData.forEach(function (row) {
                if (typeof row['key'] != "undefined") {
                    fields[row['key']] = row['key'];
                }
            });
        }

        if ((typeof req.payload['add-saved-search'] != "undefined") && Boolean(req.payload['add-saved-search']) && (typeof req.payload['saved-search-data'] != "undefined") && req.payload['saved-search-data'] != "") {
            data['saved-search'] = [];

            try {
                req.payload['saved-search-data'] = JSON.parse(req.payload['saved-search-data']);

                req.payload['saved-search-data'].forEach(function (row) {
                    if (typeof row.id != "undefined") {
                        let dateFormat = (req.payload['daterangepicker_start'] > 9999999999) ? 'x' : 'X';
                        data['saved-search'].push({
                            'id': row.id,
                            'name': (typeof row.name != "undefined") ? row.name : '',
                            'date-from': (typeof req.payload['daterangepicker_start'] != "undefined") && req.payload['daterangepicker_start'] != '' ? parseInt(moment(req.payload['daterangepicker_start'], dateFormat).format('x')) : parseInt(moment().subtract(30, 'days').format('x')),
                            'date-to': (typeof req.payload['daterangepicker_end'] != "undefined") && req.payload['daterangepicker_end'] != '' ? parseInt(moment(req.payload['daterangepicker_end'], dateFormat).format('x')) : parseInt(moment().format('x')),
                        });
                    }
                });
            } catch (e) {
            }
        }

        if ((typeof req.payload['playbooks'] != "undefined") && req.payload['playbooks'] != "") {
            try {
                req.payload['playbooks'] = JSON.parse(req.payload['playbooks']);
            } catch (e) {
            }
        }

        // Add all fields to data
        for (let index in fields) {
            if (typeof req.payload[index] != "undefined" && req.payload[index].length > 0) {
                data[fields[index]] = req.payload[index];
            }
        }

        data['name'] = (typeof data['message'] != "undefined") ? data['message'] : '';

        // Add custom field to data
        if ((typeof req.payload['events-id'] != "undefined") && req.payload['events-id'] != "") {
            data[idType] = req.payload['events-id'];

            data[idType] = data[idType].trim();

            if (data[idType].indexOf("|")) {
                data[idType] = data[idType].split("|");
            } else if (data[idType] != '') {
                data[idType] = [data[idType]];
            } else {
                data[idType] = [];
            }
        }

        data['tags'] = ["correlated"];
        data["event.labels"] = (typeof data["event.labels"] != "undefined") ? data["event.labels"] : 'Queued';
        data["@timestamp"] = parseInt(moment().format('x'));

        return data;
    }
};