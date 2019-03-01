import moment from 'moment';

let $cf = require('./../../../../server/common/function');
let presetColorGlobalPriority = require('./../../../../server/constant/priority-colors');
let presetColorGlobalSla = require('./../../../../server/constant/sla-colors');
let getStage = require('../../../stage_model/server/get-stage');
let presetColorGlobal = Object.assign({}, getStage.all, presetColorGlobalSla, presetColorGlobalPriority);

export default function (href) {
    return [
        {
            data: "id",
            field: "id",
            title: "ID",
            className: "col-id",
        }, {
            data: null,
            title: "<label class=\"checkbox-label\"></label>",
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
            data: null,
            title: "View",
            orderable: false,
            render: function (data, type, row) {
                let link = '';
                if (row.id && href) {
                    link = href + '#/cases/' + row.id;
                }

                return '<a class="table-open-link" href="' + link + '">Case&nbsp;<i class="fa fa-eye" aria-hidden="true"></i></a>';
            }
        }, {
            data: "message",
            field: "message",
            title: "Message",
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
            searchable: "operator.keyword"
        }, {
            data: "event_labels",
            field: "event.labels",
            title: "Stage",
            searchable: "event.labels.keyword"
        }, {
            data: "timestamp",
            field: "@timestamp",
            title: "@timestamp",
            validation: (value) => {
                return $cf.getDateInFormat(value, 'YYYY-MM-DD HH:mm:ss.SSS', '');
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
                    data = moment(row['timestamp'], 'YYYY-MM-DD HH:mm:ss.SSS').utc().format('YYYY-MM-DD HH:mm:ss.SSS');
                }

                return data;
            }
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
            searchable: "source.user"
        }, {
            data: "destination_user",
            field: "destination.user",
            title: "Destination.user",
            searchable: "destination.user"
        }, {
            data: "source_host",
            field: "source.hostname",
            title: "Source.host",
            searchable: "source.hostname"
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
            data: "tags",
            field: "tags",
            title: "",
            validation: (value) => {
                return (typeof  value != "undefined" && value.length > 0) ? value : [];
            },
            className: "hidden",
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