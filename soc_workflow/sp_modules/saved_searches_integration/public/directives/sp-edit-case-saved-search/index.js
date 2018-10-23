require('ui/modules').get('app/soc_workflow', []).directive('spEditCaseSavedSearch', [
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