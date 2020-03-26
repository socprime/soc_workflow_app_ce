const app = require('ui/modules').get('app/soc_workflow_ce', ['ngSanitize']).controller('OneAlertController', [
    '$scope',
    '$http',
    '$location',
    '$routeParams',
    'modal',
    'spCommonSwitchTheme',
    'spInitMethodCommon',
    'spInitOneAlertAjax',
    'spInitOneAlertPage',
    'spInitOneAlertAction',
    function ($scope, $http, $location, $routeParams, modal, spCommonSwitchTheme, spInitMethodCommon, spInitOneAlertAjax, spInitOneAlertPage, spInitOneAlertAction) {
        let currUrl = $location.$$absUrl;
        currUrl = currUrl.split('#');
        currUrl = currUrl[0];

        $scope.currUrl = currUrl;
        $scope.casesUrl = currUrl + '#/cases';
        $scope.alertsUrl = currUrl + '#/alerts';
        spCommonSwitchTheme($scope);

        $scope.allStages = [];
        $scope.userList = [];
        $scope.savedSearches = {};
        $scope.alertDataAction = [];
        $scope.alertSkippingLinks = ['cases.id', 'events_id', 'alerts_id', 'Saved Search', 'Playbooks'];

        $scope.currAlertId = $routeParams.alertId || null;
        $scope.alertRawData = {};
        $scope.alertPlainData = {};
        $scope.alertCustomData = {};
        $scope.alertLinksData = {};
        $scope.alertStageLog = [];
        $scope.alertAvailableStage = [];
        $scope.caseEnabledFieldList = [];
        $scope.allIndexPattern = [];

        $scope.uploadToAnomaliMyAttacks = false;

        // Init section
        angular.element(document).ready(() => {
            spInitOneAlertAjax($scope);

            spInitOneAlertPage($scope);

            spInitOneAlertAction($scope);

            spInitMethodCommon($scope);
        });
    }]);