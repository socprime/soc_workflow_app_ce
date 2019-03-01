import moment from 'moment';

let $cf = require('./../../../../server/common/function');
let presetColorGlobalPriority = require('./../../../../server/constant/priority-colors');
let presetColorGlobalSla = require('./../../../../server/constant/sla-colors');
let getStage = require('../../../stage_model/server/get-stage');
let presetColorGlobal = Object.assign({}, getStage.all, presetColorGlobalSla, presetColorGlobalPriority);

export default function (href) {
    return [
        {
            title: "ID",
            data: "id",
            field: "id",
            required: true,
            className: "col-id",
        }, {
            title: "<label class=\"checkbox-label\"></label>",
            data: null,
            className: "select-checkbox",
            defaultContent: '<label class="checkbox-label"></label>',
            orderable: false
        }, {
            data: "event_severity",
            field: "event.severity",
            title: "Priority",
            searchable: "event.severity",
            validation: (value) => {
                return (Object.keys(presetColorGlobalPriority).indexOf(value) < 0) ? '' : value;
            },
            render: function (data, type, row) {
                let priorityColor = typeof row['priority_color'] != 'undefined' ? row['priority_color'] : '';
                let circleClassEmpty = priorityColor == 'transparent' ? 'empty' : '';

                data = '<span class="circle-status ' + circleClassEmpty + '" style="background-color: ' + priorityColor + '">' + data + '</span>';

                return data;
            }
        }, {
            title: "View",
            data: null,
            orderable: false,
            render: function (data, type, row) {
                let link = '';
                if (row.id && href) {
                    link = href + '#/alerts/' + row.id;
                }

                return '<a class="table-open-link" href="' + link + '">Alert&nbsp;<i class="fa fa-eye" aria-hidden="true"></i></a>';
            }
        }, {
            title: "@timestamp",
            data: "timestamp",
            field: "@timestamp",
            validation: (value) => {
                return $cf.getDateInFormat(value, 'YYYY-MM-DD HH:mm:ss.SSS', '');
            },
            orderDefault: true
        }, {
            title: "UTC time",
            data: "timestamp_utc",
            field: "timestamp_utc",
            validation: (value) => {
                return '';
            },
            render: function (data, type, row) {
                if (typeof row['timestamp'] != 'undefined') {
                    data = moment(row['timestamp'], 'YYYY-MM-DD HH:mm:ss.SSS').utc().format('YYYY-MM-DD HH:mm:ss.SSS');
                }

                return data;
            }
        }, {
            title: "Message",
            data: "message",
            field: "message",
            searchable: "message.keyword"
        }, {
            title: "Source.ip",
            data: "source_ip",
            field: "source.ip",
            searchable: "source.ip"
        }, {
            title: "Destination.ip",
            data: "destination_ip",
            field: "destination.ip",
            searchable: "destination.ip"
        }, {
            title: "Source.user",
            data: "source_user",
            field: "source.user",
            searchable: "source.user"
        }, {
            title: "Destination.user",
            data: "destination_user",
            field: "destination.user",
            searchable: "destination.user"
        }, {
            title: "Source.host",
            data: "source_host",
            field: "source.hostname",
            searchable: "source.hostname"
        }, {
            title: "Destination.host",
            data: "destination_host",
            field: "destination.hostname",
            searchable: "destination.hostname"
        }, {
            title: "Image",
            data: "image",
            field: "event_data.Image",
            searchable: "event_data.Image"
        }, {
            title: "State",
            data: "event_labels",
            field: "event.labels",
            searchable: "event.labels.keyword"

        }, {
            title: "Device.product",
            data: "device_product",
            field: "device.product",
            searchable: "device.product"
        }, {
            data: "priority_color",
            field: "event_severity",
            title: "",
            validation: (value) => {
                value = $cf.isSet(value['event.severity']) ? value['event.severity'] : '';
                return (presetColorGlobal[value]) ? presetColorGlobal[value] : 'transparent';
            },
            className: "hidden",
        }
    ];
};