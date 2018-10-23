/**
 * @param scope
 * @param $http
 * @param $route
 * @param spCF
 */
module.exports = function (scope, $http, $route, spCF) {
    // event-severity
    scope.fields.push({
        name: 'Case (for the last 7d)',
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