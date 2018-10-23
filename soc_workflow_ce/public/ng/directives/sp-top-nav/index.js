import directiveTemplate from './view.html'

/**
 * @param route
 * @return {string}
 */
const getCurrentPage = function (route) {
    let page = '';
    if (route.indexOf('\/cases') > -1) {
        page = 'cases';
    } else if (route.indexOf('\/alerts') > -1) {
        page = 'alerts';
    }
    if (route.indexOf('\/events') > -1) {
        page = 'events';
    }
    return page;
};

require('ui/modules').get('app/soc_workflow_ce', []).directive('spTopNav', [
    '$rootScope',
    '$location',
    function ($rootScope, $location) {
        /**
         * @param scope
         * @param element
         * @param attrs
         * @param controller
         * @param transcludeFn
         */
        const link = function (scope, element, attrs, controller, transcludeFn) {
            scope.currentPage = getCurrentPage($location.path());
            $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
                scope.currentPage = getCurrentPage($location.path());
            });
        };

        return {
            link: link,
            template: directiveTemplate
        }
    }]);
