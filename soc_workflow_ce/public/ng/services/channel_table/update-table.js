require('ui/modules').get('app/soc_workflow_ce', []).service('spHelperUpdateTable', [
    '$timeout',
    'spCF',
    'spGetRangeFromPicker',
    'spConfigCaseTable',
    'spHelperGetTableFields',
    'spConfigTable',
    function ($timeout, spCF, spGetRangeFromPicker, spConfigCaseTable, spHelperGetTableFields, spConfigTable) {
        return function ($scope, source, customCaseTable) {
            let dateRange = spGetRangeFromPicker($scope.rangeId);
            dateRange.from = dateRange.from || 0;
            dateRange.to = dateRange.to || 0;

            let updateTable = function () {
                // Init table
                let caseConfig = spCF.isArray(customCaseTable) ? customCaseTable : spConfigCaseTable($scope.currUrl);
                $scope.tableFields = spHelperGetTableFields(caseConfig);
                $scope.tableSrc = spConfigTable(caseConfig, $scope.currUrl, source, dateRange.from, dateRange.to);
            };

            if(!$scope.$$phase) {
                $scope.$apply(updateTable);
            } else {
                $timeout(function () {
                    $scope.$apply(updateTable);
                });
            }

            return $scope;
        };
    }]);
