let initHandlers = require('./handlers');

import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow_ce', []).directive('spChannelTable', [
    '$timeout',
    'spCF',
    function ($timeout, spCF) {
        let link = function (scope, element, attrs, controller, transcludeFn) {
            if (!Array.isArray(scope.selectedItem)) {
                scope.selectedItem = [];
            }

            let tableSelector = '#' + scope.tableId;

            scope.$watch('src', function (newValue, oldValue) {
                if (Object.keys(newValue).length > 0) {
                    if (typeof newValue == 'object') {
                        if ($.fn.DataTable.isDataTable(tableSelector)) {
                            $(tableSelector).DataTable().destroy();
                            $(tableSelector).html('');
                        }

                        try {
                            $(tableSelector).DataTable(newValue);
                        } catch (e) {
                            console.log(e);
                        }
                    } else {
                        try {
                            if ($.fn.DataTable.isDataTable(tableSelector)) {
                                $(tableSelector).DataTable().draw();
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            });

            if (spCF.isArray(scope.tableRows)) {
                scope.$watch('tableRows', function (newValue, oldValue) {
                    if (spCF.isArray(newValue) && newValue != oldValue) {
                        if ($.fn.DataTable.isDataTable(tableSelector)) {
                            $(tableSelector).DataTable().destroy();
                            $(tableSelector).html('');
                        }

                        try {
                            let tableObj = $(tableSelector).DataTable(scope.src);
                            tableObj.rows.add(newValue).draw();
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });
            }

            element.ready(() => {
                initHandlers(scope, $timeout, element, spCF, tableSelector);
            });

            // Init Actions
            // Table search button processing
            scope.searchInTable = function (event) {
                $timeout(function () {
                    scope.selectedItem = [];
                    $('#' + scope.tableId).trigger('length.dt');
                });

                let _this = event.target;
                let targetTable = $(_this).closest('.card-block').find('.table.dataTable');
                let searchString = $(_this).closest('.dataTables_filter').find('input[type="search"]').val();

                targetTable.DataTable().search(searchString).draw();
            }
        };

        return {
            link: link,
            scope: {
                'tableId': '@',
                'oneItemUrl': '@',
                'src': '=tableSrc',
                'selectedItem': '=',
                'tableRows': '=?',
            },
            template: directiveTemplate
        }
    }]);
