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
    '$route',
    '$location',
    'modal',
    function ($rootScope, $route, $location, modal) {
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

            scope.showModal = function (title, body) {
                modal.show(scope, {
                    title: title || 'Title',
                    body: body || '',
                    size: 'large',
                    actions: [{
                        label: 'Save',
                        cssClass: 'btn btn-outline-danger disabled',
                        onClick: function (e) {
                            $(e.target).parents('.modal').trigger('submit-modal');
                        }
                    }, {
                        label: 'Close',
                        cssClass: 'btn btn-outline-danger',
                        onClick: function (e) {
                            $route.reload();
                        }
                    }],
                    onHide: function () {
                        $route.reload();
                    }
                });
            };
        };

        return {
            link: link,
            template: directiveTemplate
        }
    }]);
