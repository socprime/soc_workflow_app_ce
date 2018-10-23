require('ui/modules').get('app/soc_workflow_ce', [])
    .service('spInitEventsPage', ['spConfigEventsTable', function (spConfigEventsTable) {
        return function ($scope) {
            // Init table
            $scope.tableSrc = spConfigEventsTable($scope.currUrl);
        };
    }]);
