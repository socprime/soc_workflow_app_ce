require('ui/modules').get('app/soc_workflow', [])
    .service('spConfigEventsTable', [function () {
        return function (href, currDateRangeFrom, currDateRangeTo) {
            href = href || '';
            currDateRangeFrom = currDateRangeFrom || 0;
            currDateRangeTo = currDateRangeTo || 0;

            return {
                "dom": "<tlip>",
                //"order": [[ 3, "desc" ]],
                "columnDefs": [
                    {
                        targets: 0,
                        className: 'col-id',
                        searchable: false
                    }, {
                        targets: 1,
                        //"visible": false,
                        "searchable": false
                    }, {
                        targets: 2,
                        //"visible": false,
                        "searchable": false
                    }, {
                        targets: 3,
                        orderable: false,
                        className: 'select-checkbox',
                        data: null,
                        defaultContent: '<label class="checkbox-label"></label>'
                    }
                ],
                select: {
                    style: 'os',
                    selector: 'td:first-child'
                },
                columns: [
                    {data: "_id", title: "ID"},
                    {data: "_index", title: "Index"},
                    {data: "_type", title: "Type"},
                    {data: null, title: "<label class=\"checkbox-label\"></label>"},
                    {data: "content", title: "Content"}
                ],
                "language": {
                    "sInfo": "_START_ - _END_ of _TOTAL_",
                    "sInfoEmpty": "None",
                    "sInfoFiltered": "(filtered from _MAX_)",
                    "sLengthMenu": "_MENU_",
                }
            };
        };
    }]);
