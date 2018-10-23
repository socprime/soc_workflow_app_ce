const alertsRangeId = '#alerts-reportrange';

require('ui/modules').get('app/soc_workflow_ce', []).service('spInitAlertsPage', [
    'spConfigPeriod',
    'spConfigAlertsTable',
    'spInitCommonDateRangePicker',
    'spGetRangeFromPicker',
    'spInitAlertsAjax',
    function (spConfigPeriod, spConfigAlertsTable, spInitCommonDateRangePicker, spGetRangeFromPicker, spInitAlertsAjax) {
        return function ($scope) {
            // Init date range pickers
            spInitCommonDateRangePicker(alertsRangeId, 'alerts_date_range_picker_from', 'alerts_date_range_picker_to', {});

            let dateRange = spGetRangeFromPicker(alertsRangeId);
            dateRange.from = dateRange.from || 0;
            dateRange.to = dateRange.to || 0;

            $scope.$apply(function () {
                // Init date range
                $scope.dateRange.from = dateRange.from;
                $scope.dateRange.to = dateRange.to;

                // Init table
                $scope.tableSrc = spConfigAlertsTable($scope.currUrl, dateRange.from, dateRange.to);
            });
            spInitAlertsAjax($scope);

            // Set updater by period
            $scope.$watch('updatePeriod', function (newValue) {
                let updateByPeriod = function () {
                    let defaultPeriod = spConfigPeriod.getFirst();
                    let period = $scope.updatePeriod || 'Pause';
                    if (period != defaultPeriod && period != 'Pause' && parseInt(period) != NaN) {
                        setTimeout(function () {
                            spInitAlertsAjax($scope);
                            updateByPeriod();
                        }, (parseInt(period) * 1000));
                    }
                };

                updateByPeriod();
            });


            $(alertsRangeId).on('apply.daterangepicker', function (ev, picker) {
                let dateRange = spGetRangeFromPicker(alertsRangeId);
                dateRange.from = dateRange.from || 0;
                dateRange.to = dateRange.to || 0;

                $scope.$apply(function () {
                    // Update date range
                    $scope.dateRange.from = dateRange.from;
                    $scope.dateRange.to = dateRange.to;

                    // Update table
                    $scope.tableSrc = spConfigAlertsTable($scope.currUrl, dateRange.from, dateRange.to);

                    // Update ajax data
                    spInitAlertsAjax($scope);

                    // Set update period to dafault
                    $scope.updatePeriod = spConfigPeriod.getFirst();
                });
            });
        };
    }]);
