require('ui/modules').get('app/soc_workflow', []).directive('spSavedSearchIntegrationCreateCase', [
    function () {
        return {
            compile: function (element, attributes) {
                return {
                    pre: function () {},
                    post: function () {}
                }
            },
            scope: {
                savedSearches: '=',
                addSavedSearch: '=',
            },
            template: ''
        }
    }]);