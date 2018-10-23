import moment from 'moment';

require('ui/modules').get('app/soc_workflow_ce', []).service('spConfigAlertsTable', [
    function () {
        return function (href, currDateRangeFrom, currDateRangeTo) {
            href = href || '';
            currDateRangeFrom = currDateRangeFrom || 0;
            currDateRangeTo = currDateRangeTo || 0;

            return {
                dom: "<tlip>",
                lengthMenu: [5, 10, 25, 50, 100],
                order: [[4, "desc"]],
                serverSide: true,
                ajax: {
                    url: href + '/alert-update-table',
                    type: 'POST',
                    data: function (d) {
                        d.dateFrom = currDateRangeFrom;
                        d.dateTo = currDateRangeTo;
                    }
                },
                columnDefs: [
                    {
                        targets: 0,
                        className: 'col-id',
                        searchable: false
                    }, {
                        targets: 1,
                        orderable: false,
                        className: 'select-checkbox',
                        data: null,
                        defaultContent: '<label class="checkbox-label"></label>'
                    }, {
                        targets: 2,
                        render: function (data, type, row) {
                            let priorityColor = typeof row['priority_color'] != 'undefined' ? row['priority_color'] : '';
                            let circleClassEmpty = priorityColor == 'transparent' ? 'empty' : '';

                            data = '<span class="circle-status ' + circleClassEmpty + '" style="background-color: ' + priorityColor + '">' + data + '</span>';

                            return data;
                        }
                    }, {
                        targets: 3,
                        orderable: false,
                        render: function (data, type, row) {
                            let link = '';
                            if (row.id && href) {
                                link = href + '#/alerts/' + row.id;
                            }

                            return '<a class="table-open-link" href="' + link + '">Alert&nbsp;<i class="fa fa-eye" aria-hidden="true"></i></a>';
                        }
                    }, {
                        target: 4,
                    }, {
                        target: 5,
                        render: function (data, type, row) {
                            if (typeof row['timestamp'] != 'undefined') {
                                data = moment(row['timestamp'], 'YYYY-MM-DD HH:mm:ss.SSS').utc().format('YYYY-MM-DD HH:mm:ss.SSS');
                            }

                            return data;
                        }
                    }, {
                        target: 6,
                    }, {
                        target: 7,
                    }, {
                        target: 8,
                    }, {
                        target: 9,
                    }, {
                        target: 10,
                    }, {
                        target: 11,
                    }, {
                        target: 12,
                    }, {
                        target: 13,
                    }, {
                        target: 14,
                    }
                ],
                select: {
                    style: 'os',
                    selector: 'td',
                    items: 'row',
                    className: 'row-selected',
                    blurable: false
                },
                columns: [
                    {data: "id", title: "ID"},
                    {data: null, title: "<label class=\"checkbox-label\"></label>"},
                    {data: "event_severity", title: "Priority"},
                    {data: null, title: "View"},
                    {data: "timestamp", title: "@timestamp"},
                    {data: "timestamp_utc", title: "UTC time"},
                    {data: "message", title: "Message"},
                    {data: "source_ip", title: "Source.ip"},
                    {data: "destination_ip", title: "Destination.ip"},
                    {data: "source_user", title: "Source.user"},
                    {data: "destination_user", title: "Destination.user"},
                    {data: "source_host", title: "Source.host"},
                    {data: "destination_host", title: "Destination.host"},
                    {data: "image", title: "Image"},
                    {data: "event_labels", title: "State"},
                    {data: "device_product", title: "Device.product"}
                ],
                language: {
                    sInfo: "_START_ - _END_ of _TOTAL_",
                    sInfoEmpty: "None",
                    sInfoFiltered: "(filtered from _MAX_)",
                    sLengthMenu: "_MENU_",
                }
            };
        };
    }]);
