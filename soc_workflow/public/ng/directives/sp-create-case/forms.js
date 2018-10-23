/**
 * @param scope
 * @param spCF
 */
module.exports = function (scope, spCF) {
    scope.formattedEnabledFieldList = {};
    if (spCF.isArray(scope.enabledFieldList)) {
        scope.enabledFieldList.forEach(function (field) {
            if (spCF.isString(field.key) && spCF.isString(field.title)) {
                scope.formattedEnabledFieldList[field.key] = field.title;
            }
        });
    }
    scope.formattedAllStages = {};
    if (spCF.isArray(scope.allStages)) {
        scope.allStages.forEach(function (field) {
            if (spCF.isString(field)) {
                scope.formattedAllStages[field] = field;
            }
        });
    }

    // Set Source.IP
    scope.fields.push({
        name: 'Case name',
        slug: 'message',
        type: scope.fieldType.text,
        required: true
    });

    // event-severity
    scope.fields.push({
        name: 'Priority',
        slug: 'event-severity',
        type: scope.fieldType.select,
        required: true,
        list: {'10': '10', '9': '9', '8': '8', '7': '7', '6': '6', '5': '5', '4': '4', '3': '3', '2': '2', '1': '1'}
    });

    // Set current operator
    let currentOperatorName = $.trim($('[ng-controller="securityNavController"] .global-nav-link:first-child .global-nav-link__title').text());
    scope.userList = scope.userList || [];
    let tmpUserList = {};
    scope.userList.forEach(function (el) {
        tmpUserList[el] = el;
    });
    scope.fields.push({
        name: 'Operator',
        slug: 'operator',
        type: scope.fieldType.select,
        required: true,
        current: (currentOperatorName.length > 0) ? currentOperatorName : '',
        list: tmpUserList
    });

    // Set available stage
    scope.fields.push({
        name: 'Stage',
        slug: 'available-stage',
        type: scope.fieldType.select,
        list: scope.formattedAllStages,
        required: true
    });

    // Set comments
    scope.fields.push({
        name: 'Comment',
        slug: 'comment',
        type: scope.fieldType.textarea,
        required: true,
    });

    // Set Source.IP
    scope.fields.push({
        name: 'Source.IP',
        slug: 'source.ip',
        removable: true,
        type: scope.fieldType.text,
    });

    // Set Destination.IP
    scope.fields.push({
        name: 'Destination.IP',
        slug: 'destination.ip',
        removable: true,
        type: scope.fieldType.text,
    });

    // Set Device Product
    scope.fields.push({
        name: 'Device.product',
        slug: 'device.product',
        removable: true,
        type: scope.fieldType.text,
    });

    // Set playbooks
    scope.fields.push({
        name: 'Playbooks',
        slug: 'playbooks',
        type: scope.fieldType.select,
        isMultiple: 'true',
        list: scope.playbooks,
        current: scope.currentPlaybooks || [],
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