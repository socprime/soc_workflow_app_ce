require('ui/modules').get('app/soc_workflow_ce', []).service('spInitOneAlertAjax', [
    '$http',
    'spCF',
    function ($http, spCF) {
        return function ($scope) {
            let href = $scope.currUrl || false;
            if (href && $scope.currAlertId) {
                $('.cd-main-content').waitAnimationStart();
                $http({
                    method: "GET",
                    url: href + '/alert-one-entity',
                    dataType: "json",
                    params: {
                        id: $scope.currAlertId
                    }
                }).then(function successCallback(response) {
                    $('.cd-main-content').waitAnimationStop();
                    response = response.data || {};
                    if (response.success && response.success == true) {
                        $scope.allStages = response['allStages'] || [];
                        $scope.userList = response['userList'] || [];
                        $scope.savedSearches = response['savedSearches'] || {};
                        $scope.alertDataAction = response['dataAction'] || [];
                        $scope.alertRawData = response['data'] || {};
                        $scope.alertStageLog = response['stageLog'] || [];
                        $scope.alertAvailableStage = response['availableStage'] || [];
                        $scope.caseEnabledFieldList = response['caseEnabledFieldList'] || [];
                        $scope.allIndexPattern = response['allIndexPattern'] || [];

                        if (!spCF.isString($scope.alertRawData.id)) {
                            window.location.href = $scope.alertsUrl;
                        }
                    }
                }, function errorCallback(response) {
                    $('.cd-main-content').waitAnimationStop();
                    console.log('connection error');
                });
            }
        };
    }]);
