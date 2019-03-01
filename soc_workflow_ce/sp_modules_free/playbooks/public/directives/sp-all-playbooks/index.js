import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow_ce', []).directive('spAllPlaybooks', [
    '$http',
    'modal',
    'spCF',
    function ($http, modal, spCF) {
        let link = function (scope, element, attrs, controller, transcludeFn) {
            scope.playbooks = {};

            // Init Ajax
            $http({
                method: "GET",
                url: scope.currUrl + '/get-playbook',
                dataType: "json",
            }).then(function (playbookResponse) {
                playbookResponse = playbookResponse['data'] || {};
                if (playbookResponse.success && playbookResponse.success == true) {
                    playbookResponse = playbookResponse.data || [];
                    playbookResponse.forEach(function (onePlaybook) {
                        if (spCF.isString(onePlaybook['id']) && spCF.isString(onePlaybook['name'])) {
                            scope.$watch(function () {
                                scope.playbooks[onePlaybook['id']] = onePlaybook['name'];
                            });
                        }
                    });
                }
            }).catch(function (e) {
                console.log(e);
            });

            // Init Actions
            scope.showPlaybookModal = function (playbookId) {
                modal.show(scope, {
                    title: 'Playbook Info',
                    body: '<div sp-show-playbook playbook-id="' + playbookId + '" curr-url="' + scope.currUrl + '"></div>',
                    size: 'large',
                    actions: [{
                        label: 'View Cases',
                        cssClass: 'btn btn-outline-danger',
                        onClick: function (e) {
                            $(e.target).parents('.modal').find('#' + playbookId + '-cases').collapse('toggle');
                        }
                    }, {
                        label: 'Close',
                        cssClass: 'btn btn-outline-danger',
                        onClick: function (e) {
                            $(e.target).parents('.modal').modal('hide');
                        }
                    }]
                });
            };
        };

        return {
            link: link,
            scope: {
                currUrl: '='
            },
            template: directiveTemplate
        }
    }]);
