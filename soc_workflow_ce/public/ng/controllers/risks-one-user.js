import chrome from 'ui/chrome';

const app = require('ui/modules').get('app/soc_workflow_ce', ['ngSanitize']).controller('RisksOneUserController', [
    '$scope',
    '$http',
    '$location',
    '$routeParams',
    '$timeout',
    'modal',
    'spCommonSwitchTheme',
    'spInitRisksOneUserPage',
    'spInitRisksOneUserAction',
    function ($scope, $http, $location, $routeParams, $timeout, modal, spCommonSwitchTheme, spInitRisksOneUserPage, spInitRisksOneUserAction) {
        let currUrl = $location.$$absUrl;
        currUrl = currUrl.split('#');
        currUrl = currUrl[0];
        $scope.currUrl = currUrl;

        $scope.basePath = chrome.getBasePath() || '/';
        $scope.basePath = $scope.basePath == '/' ? '' : $scope.basePath;

        $scope.risksUsersUrl = currUrl + '#/risks-users';
        spCommonSwitchTheme($scope);

        $scope.currUserId = $routeParams.userId || null;

        $scope.basePath = chrome.getBasePath() || '/';
        $scope.basePath = $scope.basePath == '/' ? '' : $scope.basePath;

        // Init vars
        $scope.dateRange = {
            from: 0,
            to: 0
        };

        $scope.rangeId = '#risks-one-user-reportrange';

        $scope.charts = {
            timeline: {
                id: 'user-score-trend',
                src: [],
                obj: null
            }
        };

        $scope.userInfo = {
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
            spInitRisksOneUserPage($scope);
            $timeout(() => {
                spInitRisksOneUserAction($scope);
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
