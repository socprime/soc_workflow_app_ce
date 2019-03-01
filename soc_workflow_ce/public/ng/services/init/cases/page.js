require('ui/modules').get('app/soc_workflow_ce', []).service('spInitCasesPage', [
    'spConfigPeriod',
    'spInitCommonDateRangePicker',
    'spInitCasesAjax',
    'spConfigCaseTable',
    'spGetRangeFromPicker',
    'spInitCommonUpdateDateRangeFromPicker',
    function (spConfigPeriod, spInitCommonDateRangePicker, spInitCasesAjax, spConfigCaseTable, spGetRangeFromPicker, spInitCommonUpdateDateRangeFromPicker) {
        return function ($scope) {
            // Init date range pickers
            spInitCommonDateRangePicker($scope.rangeId, 'cases_date_range_picker_from', 'cases_date_range_picker_to', {});
            spInitCommonDateRangePicker('#edit-saved-search-range-modal', 'cases_date_range_picker_from', 'cases_date_range_picker_to', {
                "parentEl": '#edit-case-saved-search.modal',
                "timePicker": true,
                "locale": {
                    "format": 'HH:mm:ss MMM DD, YYYY'
                }
            });

            spInitCommonUpdateDateRangeFromPicker($scope);
            // Init table and date range
            spInitCasesAjax($scope);
            // Set updater by period
            $scope.$watch('updatePeriod', function (newValue) {
                let updateByPeriod = function () {
                    let period = $scope.updatePeriod || spConfigPeriod.getFirst();

                    clearTimeout($scope.periodEntity);
                    if (period != spConfigPeriod.getFirst() && parseInt(period) != NaN) {
                        $scope.periodEntity = setTimeout(function () {
                            spInitCasesAjax($scope);
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
                    spInitCasesAjax($scope);

                    // Set update period to dafault
                    $scope.updatePeriod = spConfigPeriod.getFirst();
                });
            });
        };
    }]);
