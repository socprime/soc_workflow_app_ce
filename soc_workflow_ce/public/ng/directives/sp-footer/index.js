import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow_ce', []).directive('spFooter', [
    '$route',
    '$http',
    'modal',
    function ($route, $http, modal) {
        /**
         * @param scope
         * @param element
         * @param attrs
         * @param controller
         * @param transcludeFn
         */
        const link = function (scope, element, attrs, controller, transcludeFn) {
            scope.tosContent = '';

            let alertPattern = {
                title: '',
                body: '',
                actions: [{
                    label: 'Close',
                    cssClass: 'btn btn-outline-danger',
                    onClick: function (e) {
                        $route.reload();
                    }
                }],
                onHide: function () {
                    $route.reload();
                }
            };

            let href = scope.currUrl ? scope.currUrl : null;
            if (href) {
                $http({
                    method: "GET",
                    url: href + '/get-file',
                    dataType: "json",
                    params: {
                        file: '/../../../static_content/tos.txt'
                    }
                }).then(function successCallback(response) {
                    response = response.data || {};
                    if (response.success && response.success == true && response.text) {
                        scope.tosContent = response.text;
                    }
                }, function errorCallback(response) {
                    console.log('connection error');
                });
            }

            // Init Actions
            scope.showTosModal = function () {
                modal.show(scope, Object.assign({}, alertPattern, {
                    title: 'Terms of Use',
                    body: '<div ng-bind-html="tosContent"></div>',
                    size: 'large'
                }));
            }
        };

        return {
            link: link,
            scope: {
                'currUrl': '=',
            },
            template: directiveTemplate
        }
    }]);
