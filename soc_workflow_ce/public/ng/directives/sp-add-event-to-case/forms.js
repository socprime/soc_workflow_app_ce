/**
 * @param scope
 * @param $http
 * @param $route
 * @param spCF
 */
module.exports = function (scope, $http, $route, spCF) {
    scope.fields.push({
        name: 'Select case period',
        slug: 'case-period',
        type: scope.fieldType.select,
        required: true,
        list: scope.casePeriod,
        current:[Object.values(scope.casePeriod)[0]]
    });

    // event-severity
    scope.fields.push({
        name: 'Case (for the last 1d)',
        slug: 'case',
        type: scope.fieldType.select,
        required: true,
        list: scope.caseList
    });

    // Set events
    let eventsField = {
        name: 'Events Id',
        slug: 'events-id',
        type: scope.fieldType.textarea,
        isReadolny: true
    };
    if (spCF.isArray(scope.eventsId)) {
        eventsField['current'] = scope.eventsId.join(";\n");
    }
    scope.fields.push(eventsField);
};