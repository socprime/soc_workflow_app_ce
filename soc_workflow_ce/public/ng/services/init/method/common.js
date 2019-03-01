require('ui/modules').get('app/soc_workflow_ce', [])
    .service('spInitMethodCommon', ['modal', function (modal) {
        return function ($scope) {
            /**
             * @param playbookId
             */
            $scope.showPlaybookModal = function (playbookId) {
                modal.show($scope, {
                    title: 'Playbook Info',
                    body: '<div sp-show-playbook playbook-id="' + playbookId + '" curr-url="' + $scope.currUrl + '"></div>',
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
    }]);
