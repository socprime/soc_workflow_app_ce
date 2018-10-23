import directiveTemplate from './view.html'
import directiveSubItemTemplate from './view-sub-item.html'

require('ui/modules').get('app/soc_workflow_ce', []).directive('spDataActionButton', [
    'spCF',
    function (spCF) {
        /**
         * @param scope
         * @param element
         * @param attrs
         * @param controller
         * @param transcludeFn
         */
        const link = function (scope, element, attrs, controller, transcludeFn) {
            scope.actions = scope.actions || {};
        };

        return {
            compile: function (element, attributes) {
                return {
                    pre: function (scope, element, attributes, controller, transcludeFn) {
                        scope.additionalClass = spCF.isString(scope.additionalClass) ? ' ' + scope.additionalClass : '';
                    },
                    post: link
                }
            },
            scope: {
                rowKey: '@',
                rowData: '@',
                currEntityType: '@',
                additionalClass: '@',
                currUrl: '=',
                currEntityId: '=',
                actions: '='
            },
            template: directiveTemplate
        }
    }]).directive('spDataActionButtonSubItem', [
    '$http',
    '$route',
    'spCF',
    'modal',
    function ($http, $route, spCF, modal) {
        const preLink = function (scope, element, attributes, controller, transcludeFn) {
            scope.subActions = scope.subActions || {};
            scope.hasChild = true;
            if (
                spCF.isString(scope.subActions.name) &&
                (
                    spCF.isString(scope.subActions.link) ||
                    spCF.isString(scope.subActions.command)
                )
            ) {
                return false;
            }

            scope.subName = Object.keys(scope.subActions)[0];
            scope.subValue = scope.subActions[Object.keys(scope.subActions)[0]];
        };

        const link = function (scope, element, attrs, controller, transcludeFn) {
            /**
             * @param link
             * @param functions
             * @return string
             */
            scope.externalLookup = function (link, functions) {
                let value = scope.rowData;

                functions = spCF.isArray(functions) ? functions : [];
                functions.forEach(function (oneFilter) {
                    switch (oneFilter) {
                        case 'base64':
                            value = typeof value == 'string' ? value : '';
                            value = btoa(encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, function (match, p1) {
                                return String.fromCharCode(parseInt(p1, 16))
                            }));
                            value = value.replace(/[=]+$/, '');
                            break;
                    }
                });

                return link.replace('[[value]]', value);
            };

            /**
             * @param actionName
             */
            scope.dataEnrichment = function (actionName) {
                let oneCaseContainer = $('.cd-filter-right.is-visible');

                let alertPattern = {
                    title: '',
                    body: '',
                    actions: [{
                        label: 'Close',
                        cssClass: 'btn btn-outline-danger waves-effect waves-light',
                        onClick: function (e) {
                            oneCaseContainer.waitAnimationStop();
                            $route.reload();
                        }
                    }],
                    onHide: function () {
                        oneCaseContainer.waitAnimationStop();
                        $route.reload();
                    }
                };

                oneCaseContainer.waitAnimationStart();
                $http({
                    method: "POST",
                    url: scope.currUrl + '/enrich-data',
                    dataType: "json",
                    data: {
                        id: scope.currEntityId,
                        type: scope.currEntityType,
                        name: actionName,
                        dataName: scope.rowKey,
                        dataValue: scope.rowData
                    },
                }).then(function successCallback(response) {
                    response = response.data || {};
                    if (response.success && response.success == true && spCF.isString(response.message)) {
                        modal.show(scope, Object.assign({}, alertPattern, {
                            title: 'Info',
                            body: '<pre>' + response.message + '</pre>',
                        }));
                    } else {
                        let message = response.message ? response.message : 'something went wrong';

                        modal.show(scope, Object.assign({}, alertPattern, {
                            title: 'Error',
                            body: message,
                        }));
                    }
                }, function errorCallback(response) {
                    oneCaseContainer.waitAnimationStop();
                    console.log('connection error');
                });
            };
        };

        return {
            compile: function (element, attributes) {
                return {
                    pre: preLink,
                    post: link
                }
            },
            scope: {
                rowKey: '@',
                rowData: '@',
                currEntityId: '@',
                currEntityType: '@',
                currUrl: '=',
                subActions: '='
            },
            template: directiveSubItemTemplate
        }
    }])
;
