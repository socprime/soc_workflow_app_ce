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
            className: "col-id"
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
                    link = href + '#/cases/' + row.id;
                }

                return '<a class="table-open-link" href="' + link + '">Case&nbsp;<i class="fa fa-eye" aria-hidden="true"></i></a>';
            }
        }, {
            title: "Message",
            data: "message",
            field: "message",
            required: true,
            searchable: "message.keyword",
            render: function (data, type, row) {
                let tags = typeof row['tags'] != 'undefined' ? row['tags'] : [];

                try {
                    tags = tags.join('</span><span class="badge badge-blue-grey m-r-5">');
                } catch (e) {
                    tags = '';
                }

                data = row['message'];

                if (tags.length > 0) {
                    data += '<br><span class="tags-line"><b class="b-sm">Tags:</b> <span class="badge badge-blue-grey m-r-5">' + tags + '</span></span>';
                }

                return data;
            }
        }, {
            data: "alerts",
            field: "alerts_id",
            title: "Alerts",
            validation: (value) => {
                return (typeof  value == "object" && value.length > 0) ? value.length : 0;
            },
            orderable: false
        }, {
            data: "events",
            field: "events_id",
            title: "Events",
            validation: (value) => {
                return (typeof  value == "object" && value.length > 0) ? value.length : 0;
            },
            orderable: false
        }, {
            data: "operator",
            field: "operator",
            title: "Operator",
            required: true,
            searchable: "operator.keyword"
        }, {
            data: "event_labels",
            field: "event.labels",
            title: "Stage",
            required: true,
            searchable: "event.labels.keyword"
        }, {
            data: "timestamp",
            field: "@timestamp",
            title: "@timestamp",
            validation: (value) => {
                return $cf.getDateInFormat(value, 'x', '');
            },
            render: function (data, type, row) {
                return moment(data, 'x').format('YYYY-MM-DD HH:mm:ss.SSS');
            },
            orderDefault: true
        }, {
            data: "timestamp_utc",
            field: "timestamp_utc",
            title: "UTC time",
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
            data: "source_ip",
            field: "source.ip",
            title: "Source.ip",
            searchable: "source.ip"
        }, {
            data: "destination_ip",
            field: "destination.ip",
            title: "Destination.ip",
            searchable: "destination.ip"
        }, {
            data: "source_user",
            field: "source.user",
            title: "Source.user",
            searchable: "source.user.keyword"
        }, {
            data: "destination_user",
            field: "destination.user",
            title: "Destination.user",
            searchable: "destination.user"
        }, {
            data: "source_host",
            field: "source.hostname",
            title: "Source.host",
            searchable: "source.hostname.keyword"
        }, {
            data: "destination_host",
            field: "destination.hostname",
            title: "Destination.host",
            searchable: "destination.hostname"
        }, {
            data: "image",
            field: "event_data.Image",
            title: "Image",
            searchable: "event_data.Image"
        }, {
            title: "",
            data: "tags",
            field: "tags",
            required: true,
            validation: (value) => {
                return (typeof  value != "undefined" && value.length > 0) ? value : [];
            },
            className: "hidden",
        }, {
            title: "",
            data: "priority_color",
            field: "event.severity",
            required: true,
            validation: (value) => {
                value = '' + value;
                return (presetColorGlobal[value]) ? presetColorGlobal[value] : 'transparent';
            },
            className: "hidden",
        }
    ];
};