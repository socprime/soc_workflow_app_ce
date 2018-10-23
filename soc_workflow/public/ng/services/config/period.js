const period = [
    'Pause',
    '5 seconds',
    '10 seconds',
    '30 seconds',
    '60 seconds'
];

require('ui/modules').get('app/soc_workflow', []).service('spConfigPeriod', [
    function () {
        return {
            getAll: function () {
                return period;
            },
            getFirst: function () {
                return period[0] || 'Pause';
            }
        };
    }]);
