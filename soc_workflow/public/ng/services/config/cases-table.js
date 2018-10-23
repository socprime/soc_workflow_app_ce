import moment from 'moment';

require('ui/modules').get('app/soc_workflow', []).service('spConfigCasesTable', [
    function () {
        return function (href, currDateRangeFrom, currDateRangeTo) {
            href = href || '';
            currDateRangeFrom = currDateRangeFrom || 0;
            currDateRangeTo = currDateRangeTo || 0;

            return {
                dom: "<tlip>",
                lengthMenu: [5, 10, 25, 50, 100],
                order: [[9, "desc"]],
                serverSide: true,
                ajax: {
                    url: href + '/cases-update-table',
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
                        className: 'select-checkbox',
                        data: null,
                        defaultContent: '<label class="checkbox-label"></label>',
                        orderable: false
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
                                link = href + '#/cases/' + row.id;
                            }

                            return '<a class="table-open-link" href="' + link + '">Case&nbsp;<i class="fa fa-eye" aria-hidden="true"></i></a>';
                        }
                    }, {
                        targets: 4,
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
                        targets: 5,
                        orderable: false
                    }, {
                        targets: 6,
                        orderable: false
                    }, {
                        targets: 7,
                    }, {
                        targets: 8,
                    }, {
                        targets: 9,
                    }, {
                        targets: 10,
                        render: function (data, type, row) {
                            if (typeof row['timestamp'] != 'undefined') {
                                data = moment(row['timestamp'], 'YYYY-MM-DD HH:mm:ss.SSS').utc().format('YYYY-MM-DD HH:mm:ss.SSS');
                            }

                            return data;
                        }
                    }, {
                        targets: 11,
                    }, {
                        targets: 12,
                    }, {
                        targets: 13,
                    }, {
                        targets: 14,
                    }, {
                        targets: 15,
                    }, {
                        targets: 16,
                    }, {
                        targets: 17,
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
                    {data: "message", title: "Message"},
                    {data: "alerts", title: "Alerts"},
                    {data: "events", title: "Events"},
                    {data: "operator", title: "Operator"},
                    {data: "event_labels", title: "Stage"},
                    {data: "timestamp", title: "@timestamp"},
                    {data: "timestamp_utc", title: "UTC time"},
                    {data: "source_ip", title: "Source.ip"},
                    {data: "destination_ip", title: "Destination.ip"},
                    {data: "source_user", title: "Source.user"},
                    {data: "destination_user", title: "Destination.user"},
                    {data: "source_host", title: "Source.host"},
                    {data: "destination_host", title: "Destination.host"},
                    {data: "image", title: "Image"}
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
