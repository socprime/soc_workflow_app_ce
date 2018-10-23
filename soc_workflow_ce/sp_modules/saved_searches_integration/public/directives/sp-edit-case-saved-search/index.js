require('ui/modules').get('app/soc_workflow_ce', []).directive('spEditCaseSavedSearch', [
    function () {
        return {
            compile: function (element, attributes) {
                return {
                    pre: function () {
                    },
                    post: function () {
                    }
                }
            },
            scope: {
                currCaseId: '=',
                currUrl: '=',
                selectedItem: '=',
                savedSearches: '=',
                caseSavedSearchString: '=',
            },
            template: ''
        }
    }]);