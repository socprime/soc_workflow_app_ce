require('jquery.cookie');
let moment = require('moment-timezone');

require('ui/modules').get('app/soc_workflow_ce', []).service('spConfigTable', [
    'spCF',
    function (spCF) {
        return function (fields, currUrl, source, currDateRangeFrom, currDateRangeTo) {
            currUrl = currUrl || '';
            source = source || '';
            let href = currUrl + '/ajax-update-channel-table?source=' + source;
            currDateRangeFrom = currDateRangeFrom || 0;
            currDateRangeTo = currDateRangeTo || 0;

            let orderField = 0;
            let columnDefs = [];
            let columns = [];
            if (spCF.isArray(fields)) {
                let allowedFieldsCookie = $.cookie('soc-channel-table-' + source + '-allowed-fields');
                try {
                    allowedFieldsCookie = JSON.parse(allowedFieldsCookie);
                } catch (e) {
                    allowedFieldsCookie = [];
                }

                fields.forEach(function (el, key) {
                    if (
                        spCF.isSet(el.data) &&
                        ((spCF.isSet(el.required) && el.required == true) ||
                        (spCF.isString(el.title) && allowedFieldsCookie.indexOf(el.title) >= 0))
                    ) {
                        let columnDef = {};
                        columnDef.targets = columns.length;
                        if (spCF.isBool(el.orderable)) columnDef.orderable = el.orderable;
                        if (spCF.isString(el.searchable)) columnDef.searchable = el.searchable;
                        if (spCF.isString(el.className)) columnDef.className = el.className;
                        if (spCF.isSet(el.data) && el.data === null) columnDef.data = null;
                        if (spCF.isString(el.defaultContent)) columnDef.defaultContent = el.defaultContent;
                        if (spCF.isFunction(el.render)) columnDef.render = el.render;

                        columnDefs.push(columnDef);

                        columns.push({
                            data: el.data,
                            title: spCF.isSet(el.title) ? el.title : el.data,
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
                        d.clienttimezone = moment.tz.guess();
                        d.clienttimezone = typeof d.clienttimezone == 'string' ? d.clienttimezone : "UTC";
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
