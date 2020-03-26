require('ui/modules').get('app/soc_workflow_ce', []).service('spHelperGetTableFields', [
    'spCF',
    function (spCF) {
        return function (fields) {
            fields = spCF.isArray(fields) ? fields : [];
            let result = [];

            fields.forEach(function (item, key) {
                let isRequired = item.required || false;
                if (isRequired !== true && spCF.isString(item.title)) {
                    result.push(item.title);
                }
            });

            return result;
        };
    }]);
