import chrome from 'ui/chrome';

const app = require('ui/modules').get('app/soc_workflow_ce', ['ngSanitize']).controller('RisksOneHostController', [
    '$scope',
    '$http',
    '$location',
    '$routeParams',
    '$timeout',
    'modal',
    'spCommonSwitchTheme',
    'spInitRisksOneHostPage',
    'spInitRisksOneHostAction',
    function ($scope, $http, $location, $routeParams, $timeout, modal, spCommonSwitchTheme, spInitRisksOneHostPage, spInitRisksOneHostAction) {
        let currUrl = $location.$$absUrl;
        currUrl = currUrl.split('#');
        currUrl = currUrl[0];
        $scope.currUrl = currUrl;

        $scope.basePath = chrome.getBasePath() || '/';
        $scope.basePath = $scope.basePath == '/' ? '' : $scope.basePath;

        $scope.risksHostsUrl = currUrl + '#/risks-hosts';
        spCommonSwitchTheme($scope);

        $scope.currHost = $routeParams.hostId || null;

        $scope.basePath = chrome.getBasePath() || '/';
        $scope.basePath = $scope.basePath == '/' ? '' : $scope.basePath;

        // Init vars
        $scope.dateRange = {
            from: 0,
            to: 0
        };

        $scope.rangeId = '#risks-one-host-reportrange';

        $scope.charts = {
            timeline: {
                id: 'host-score-trend',
                src: [],
                obj: null
            }
        };

        $scope.hostInfo = {
            name: '-',
            email: '-',
            department: '-',
            logins: '-',
            score: '-',
        };

        $scope.counts = {
            cases: '-',
            alerts: '-',
            hosts: '-',
        };

        $scope.selectedViewTab = 'forensics-view';

        $scope.userList = {};

        // Init section
        angular.element(document).ready(() => {
            spInitRisksOneHostPage($scope);
            $timeout(() => {
                spInitRisksOneHostAction($scope);
            });
        });

        $scope.collapseOneCard = function (event) {
            $(event.target).closest('[data-card-wrap=data-card-wrap]').toggleClass('is-open').children('[data-card-body=data-card-body]').slideToggle(200);

            if ($(event.target).hasClass('scroll-top')) {
                $('html, body').animate({
                    scrollTop: $($(event.target)).offset().top - 84 + "px"
                }, {
                    duration: 500,
                    easing: "swing"
                });
                return false;
            }
        };
    }]);
