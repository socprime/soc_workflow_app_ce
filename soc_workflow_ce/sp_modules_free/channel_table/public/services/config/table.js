require('ui/modules').get('app/soc_workflow_ce', []).service('spConfigTable', [
    'spCF',
    function (spCF) {
        return function (fields, currUrl, source, currDateRangeFrom, currDateRangeTo) {
            let href = currUrl + '/ajax-update-channel-table?source=' + source;
            currDateRangeFrom = currDateRangeFrom || 0;
            currDateRangeTo = currDateRangeTo || 0;

            let orderField = 0;
            let columnDefs = [];
            let columns = [];
            if (spCF.isArray(fields)) {
                fields.forEach(function (el, key) {
                    if (spCF.isSet(el.data)) {
                        let columnDef = {};
                        columnDef.targets = key;
                        if (spCF.isBool(el.orderable)) columnDef.orderable = el.orderable;
                        if (spCF.isBool(el.searchable)) columnDef.searchable = el.searchable;
                        if (spCF.isString(el.className)) columnDef.className = el.className;
                        if (spCF.isSet(el.data) && el.data === null) columnDef.data = null;
                        if (spCF.isString(el.defaultContent)) columnDef.defaultContent = el.defaultContent;
                        if (spCF.isFunction(el.render)) columnDef.render = el.render;

                        columnDefs.push(columnDef);

                        columns.push({
                            data: el.data,
                            title: spCF.isSet(el.title) ? el.title : el.data
                        });

                        if (spCF.isBool(el.orderDefault) && el.orderDefault === true) {
                            orderField = key;
                        }
                    }
                });
            }

            return {
                dom: "<tlip>",
                lengthMenu: [5, 10, 25, 50, 100],
                order: [[orderField, "desc"]],
                serverSide: true,
                ajax: {
                    url: href,
                    type: 'POST',
                    data: function (d) {
                        d.dateFrom = currDateRangeFrom;
                        d.dateTo = currDateRangeTo;
                    }
                },
                columnDefs: columnDefs,
                select: {
                    style: 'os',
                    selector: 'td',
                    items: 'row',
                    className: 'row-selected',
                    blurable: false
                },
                columns: columns,
                language: {
                    sInfo: "_START_ - _END_ of _TOTAL_",
                    sInfoEmpty: "None",
                    sInfoFiltered: "(filtered from _MAX_)",
                    sLengthMenu: "_MENU_",
                }
            };
        };
    }]);
