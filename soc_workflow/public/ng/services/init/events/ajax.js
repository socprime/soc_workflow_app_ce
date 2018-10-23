require('ui/modules').get('app/soc_workflow', []).service('spInitEventsAjax', [
    '$http',
    'spGetRangeFromPicker',
    function ($http, spGetRangeFromPicker) {
        return function ($scope) {
            let href = $scope.currUrl || false;
            if (href) {
                $http({
                    method: "GET",
                    url: href + '/event-update',
                    dataType: "json",
                    params: {}
                }).then(function successCallback(response) {
                    response = response.data || {};
                    if (response.success && response.success == true) {
                        $scope.caseEnabledFieldList = response.caseEnabledFieldList || [];
                        $scope.savedSearches = response.savedSearches || [];
                        $scope.allStages = response.allStages || [];
                        $scope.userList = response.userList || [];
                    }
                }, function errorCallback(response) {
                    console.log('connection error');
                });
            }
        };
    }]);
