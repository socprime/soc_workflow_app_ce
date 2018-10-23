const casesRangeId = '#cases-reportrange';

require('ui/modules').get('app/soc_workflow_ce', []).service('spInitCasesPage', [
    'spConfigPeriod',
    'spInitCommonDateRangePicker',
    'spGetRangeFromPicker',
    'spInitCasesAjax',
    'spConfigCasesTable',
    function (spConfigPeriod, spInitCommonDateRangePicker, spGetRangeFromPicker, spInitCasesAjax, spConfigCasesTable) {
        return function ($scope) {
            // Init date range pickers
            spInitCommonDateRangePicker(casesRangeId, 'cases_date_range_picker_from', 'cases_date_range_picker_to', {});
            spInitCommonDateRangePicker('#edit-saved-search-range-modal', 'cases_date_range_picker_from', 'cases_date_range_picker_to', {
                "parentEl": '#edit-case-saved-search.modal',
                "timePicker": true,
                "locale": {
                    "format": 'HH:mm:ss MMM DD, YYYY'
                }
            });

            let dateRange = spGetRangeFromPicker(casesRangeId);
            dateRange.from = dateRange.from || 0;
            dateRange.to = dateRange.to || 0;

            $scope.$apply(function () {
                // Init date range
                $scope.dateRange.from = dateRange.from;
                $scope.dateRange.to = dateRange.to;

                // Init table
                $scope.tableSrc = spConfigCasesTable($scope.currUrl, dateRange.from, dateRange.to);
            });
            spInitCasesAjax($scope);

            // Set updater by period
            $scope.$watch('updatePeriod', function (newValue) {
                let updateByPeriod = function () {
                    let period = $scope.updatePeriod || spConfigPeriod.getFirst();
                    if (period != spConfigPeriod.getFirst() && parseInt(period) != NaN) {
                        setTimeout(function () {
                            spInitCasesAjax($scope);
                            updateByPeriod();
                        }, (parseInt(period) * 1000));
                    }
                };

                updateByPeriod();
            });


            $(casesRangeId).on('apply.daterangepicker', function (ev, picker) {
                let dateRange = spGetRangeFromPicker(casesRangeId);
                dateRange.from = dateRange.from || 0;
                dateRange.to = dateRange.to || 0;

                $scope.$apply(function () {
                    // Update date range
                    $scope.dateRange.from = dateRange.from;
                    $scope.dateRange.to = dateRange.to;

                    // Update table
                    $scope.tableSrc = spConfigCasesTable($scope.currUrl, dateRange.from, dateRange.to);

                    // Update ajax data
                    spInitCasesAjax($scope);

                    // Set update period to dafault
                    $scope.updatePeriod = spConfigPeriod.getFirst();
                });
            });
        };
    }]);
