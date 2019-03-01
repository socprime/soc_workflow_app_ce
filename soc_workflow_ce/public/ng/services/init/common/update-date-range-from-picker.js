require('ui/modules').get('app/soc_workflow_ce', []).service('spInitCommonUpdateDateRangeFromPicker', [
    'spGetRangeFromPicker',
    function (spGetRangeFromPicker) {
        return function ($scope) {
            let dateRange = spGetRangeFromPicker($scope.rangeId);
            dateRange.from = dateRange.from || 0;
            dateRange.to = dateRange.to || 0;

            // Init date range
            $scope.dateRange.from = dateRange.from;
            $scope.dateRange.to = dateRange.to;
        };
    }]);
