require('ui/modules').get('app/soc_workflow_ce', []).service('spInitAlertsAjax', [
    '$http',
    'spCF',
    'spHelperUpdateTable',
    'spConfigAlertTable',
    function ($http, spCF, spHelperUpdateTable, spConfigAlertTable) {
        return function ($scope) {
            let href = $scope.currUrl || false;
            let dateRange = $scope.dateRange || {};
            let baseFields = spConfigAlertTable($scope.currUrl);

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

                        // Update table
                        $scope.tableSrc = {};
                        if (spCF.isArray(response.tableFields)) {
                            let baseFieldsName = [];
                            if (spCF.isArray(baseFields)) {
                                baseFieldsName = baseFields.map((el) => { return spCF.isString(el.field) ? el.field : ''; });
                            }

                            response.tableFields.forEach(function (field) {
                                if (spCF.isString(field.data) && baseFieldsName.indexOf(field.data) < 0) {
                                    baseFields.push(field);
                                }
                            });

                            $scope = spHelperUpdateTable($scope, 'alerts', baseFields);
                        }
                    }
                }, function errorCallback(response) {
                    $('.cd-main-content').waitAnimationStop();
                    console.log('connection error');
                });

                $('[table-id=' + $scope.workflowTableId + ']').on('select2-changed', function (event) {
                    $scope = spHelperUpdateTable($scope, 'alerts', baseFields);
                });
            }
        };
    }]);
