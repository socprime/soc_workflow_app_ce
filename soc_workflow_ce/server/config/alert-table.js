let moment = require('moment-timezone');

const moduleFolder = require('./../constant/module-folder');

let $cf = require('./../../server/common/function');
let presetColorGlobalPriority = require('./../../server/constant/priority-colors');
let presetColorGlobalSla = require('./../../server/constant/sla-colors');
const getStage = require(`../../${moduleFolder}/server/models/stage/get`);
let presetColorGlobal = Object.assign({}, getStage.all, presetColorGlobalSla, presetColorGlobalPriority);

export default function (href) {
    return [
        {
            title: "ID",
            data: "id",
            field: "id",
            required: true,
            searchable: "id.keyword",
            className: "col-id",
        }, {
            title: "<label class=\"checkbox-label\"></label>",
            data: null,
            required: true,
            className: "select-checkbox",
            defaultContent: '<label class="checkbox-label"></label>',
            orderable: false
        }, {
            title: "Priority",
            data: "event_severity",
            field: "event.severity",
            required: true,
            searchable: "event.severity",
            validation: (value) => {
                value = '' + value;
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
            required: true,
            orderable: false,
            render: function (data, type, row) {
                let link = '';
                if (row.id && href) {
                    link = href + '#/alerts/' + row.id;
                }

                return '<a class="table-open-link" href="' + link + '">Alert&nbsp;<i class="fa fa-eye" aria-hidden="true"></i></a>';
            }
        }, {
            title: "Message",
            data: "message",
            field: "message",
            required: true,
            searchable: "message.keyword"
        }, {
            title: "@timestamp",
            data: "timestamp",
            field: "@timestamp",
            validation: (value) => {
                return $cf.getDateInFormat(value, 'x', '');
            },
            render: function (data, type, row) {
                return moment(data, 'x').format('YYYY-MM-DD HH:mm:ss.SSS');
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
                    data = moment(row['timestamp'], 'x').utc().format('YYYY-MM-DD HH:mm:ss.SSS');
                }

                return data;
            },
            searchable: "@timestamp"
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
            searchable: "source.hostname.keyword"
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
            title: "",
            data: "priority_color",
            field: "event.severity",
            required: true,
            validation: (value) => {
                value = '' + value;
                return $cf.isSet(presetColorGlobal[value]) ? presetColorGlobal[value] : 'transparent';
            },
            className: "hidden",
        }
    ];
};