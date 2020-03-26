const app = require('ui/modules').get('app/soc_workflow_ce', ['ngSanitize']).controller('OneCaseController', [
    '$scope',
    '$http',
    '$location',
    '$routeParams',
    'modal',
    'spCommonSwitchTheme',
    'spInitMethodCommon',
    'spInitOneCaseAjax',
    'spInitOneCasePage',
    'spInitOneCaseAction',
    function ($scope, $http, $location, $routeParams, modal, spCommonSwitchTheme, spInitMethodCommon, spInitOneCaseAjax, spInitOneCasePage, spInitOneCaseAction) {
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
        $scope.graphWorkspace = {};
        $scope.caseDataAction = [];
        $scope.caseSkippingLinks = ['events_id', 'alerts_id', 'Saved Search', 'Playbooks'];

        $scope.currCaseId = $routeParams.caseId || null;
        $scope.caseRawData = {};
        $scope.casePlainData = {};
        $scope.caseCustomData = {};
        $scope.caseLinksData = {};
        $scope.caseStageLog = [];
        $scope.caseAvailableStage = [];
        $scope.caseEnabledFieldList = [];

        // Init section
        angular.element(document).ready(() => {
            spInitOneCaseAjax($scope);

            spInitOneCasePage($scope);

            spInitOneCaseAction($scope);

            spInitMethodCommon($scope);
        });
    }]);
