import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow', []).directive('spShowPlaybook', [
    '$http',
    'spCF',
    function ($http, spCF) {
        /**
         * @param scope
         * @param element
         * @param attrs
         * @param controller
         * @param transcludeFn
         */
        let link = function (scope, element, attrs, controller, transcludeFn) {
            scope.playbookContent = '';
            scope.playbookCases = [];

            scope.$watch('playbookId', function (newValue, oldValue) {
                let href = spCF.isString(scope.currUrl) ? scope.currUrl + '/get-playbook' : false;
                if (href && spCF.isString(newValue)) {
                    $http({
                        method: "GET",
                        url: href,
                        dataType: "json",
                        params: {
                            id: newValue
                        }
                    }).then(function successCallback(response) {
                        response = response.data || {};
                        if (response.success && response.success == true) {
                            response = response.data;
                            let title = spCF.isString(response.name) ? response.name : false;
                            let body = spCF.isString(response.body) ? atob(response.body) : '';

                            if (title) {
                                element.parents('.modal').find('.modal-header .modal-title').append(' - ' + title);
                            }
                            scope.playbookContent = body;

                            scope.playbookCases = response.cases || [];
                        }
                    }, function errorCallback(response) {
                        console.log('connection error');
                    });
                }
            });
        };

        return {
            link: link,
            scope: {
                playbookId: '@',
                currUrl: '@',
            },
            template: directiveTemplate
        }
    }]);
