require('ui/modules').get('app/soc_workflow_ce', []).service('spInitAlertsPage', [
    'spConfigPeriod',
    'spInitCommonDateRangePicker',
    'spInitAlertsAjax',
    'spConfigAlertTable',
    'spGetRangeFromPicker',
    'spInitCommonUpdateDateRangeFromPicker',
    function (spConfigPeriod, spInitCommonDateRangePicker, spInitAlertsAjax, spConfigAlertTable, spGetRangeFromPicker, spInitCommonUpdateDateRangeFromPicker) {
        return function ($scope) {
            // Init date range pickers
            spInitCommonDateRangePicker($scope.rangeId, 'alerts_date_range_picker_from', 'alerts_date_range_picker_to', {});

            spInitCommonUpdateDateRangeFromPicker($scope);
            spInitAlertsAjax($scope);

            // Set updater by period
            $scope.$watch('updatePeriod', function (newValue) {
                let updateByPeriod = function () {
                    let defaultPeriod = spConfigPeriod.getFirst();
                    let period = $scope.updatePeriod || 'Pause';
                    clearTimeout($scope.periodEntity);
                    if (period != defaultPeriod && period != 'Pause' && parseInt(period) != NaN) {
                        $scope.periodEntity = setTimeout(function () {
                            spInitAlertsAjax($scope);
                            updateByPeriod();
                        }, (parseInt(period) * 1000));
                    }
                };

                updateByPeriod();
            });

            $scope.$on("$destroy", function(){
                clearTimeout($scope.periodEntity);
            });

            $($scope.rangeId).on('apply.daterangepicker', function (ev, picker) {
                $scope.$apply(function () {
                    spInitCommonUpdateDateRangeFromPicker($scope);

                    // Update ajax data
                    spInitAlertsAjax($scope);

                    // Set update period to dafault
                    $scope.updatePeriod = spConfigPeriod.getFirst();
                });
            });
        };
    }]);
