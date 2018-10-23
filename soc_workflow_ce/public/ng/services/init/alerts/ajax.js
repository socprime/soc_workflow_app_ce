require('ui/modules').get('app/soc_workflow_ce', []).service('spInitAlertsAjax', [
    '$http',
    function ($http) {
        return function ($scope) {
            let href = $scope.currUrl || false;
            let dateRange = $scope.dateRange || {};

            if (href) {
                $('.cd-main-content').waitAnimationStart();
                $http({
                    method: "GET",
                    url: href + '/alert-update',
                    dataType: "json",
                    params: {
                        dateFrom: dateRange.from,
                        dateTo: dateRange.to
                    }
                }).then(function successCallback(response) {
                    $('.cd-main-content').waitAnimationStop();
                    response = response.data || {};
                    if (response.success && response.success == true) {
                        $scope.chartsSrc.byStage = response.donutByStage || {};
                        $scope.chartsSrc.byPriority = response.donutByPriority || {};
                        $scope.chartsSrc.bySla = response.donutBySla || {};
                        $scope.chartsSrc.timeline = response.timeline || {};
                        $scope.caseEnabledFieldList = response.caseEnabledFieldList || [];
                        $scope.savedSearches = response.savedSearches || {};
                        $scope.allStages = response.allStages || [];
                        $scope.userList = response.userList || [];
                    }
                }, function errorCallback(response) {
                    $('.cd-main-content').waitAnimationStop();
                    console.log('connection error');
                });
            }
        };
    }]);
