/**
 * @param href
 * @param localScope
 * @param $http
 * @param spCF
 */
module.exports = function (href, localScope, $http, spCF) {
    // Load playbooks
    $http({
        method: "GET",
        url: href + '/get-playbook',
        dataType: "json",
    }).then(function (playbookResponse) {
        playbookResponse = playbookResponse['data'] || {};
        if (playbookResponse.success && playbookResponse.success == true) {
            playbookResponse = playbookResponse.data || [];
            playbookResponse.forEach(function (onePlaybook) {
                if (spCF.isString(onePlaybook['id']) && spCF.isString(onePlaybook['name'])) {
                    localScope.playbooks[onePlaybook['id']] = onePlaybook['name'];
                }
            });
        }
    }).catch(function (e) {
        console.log(e);
    });

    let isCase = spCF.isString(localScope.caseId) && localScope.caseId.length > 0;
    let isAlerts = spCF.isArray(localScope.alertsList) && localScope.alertsList.length > 0;
    let isEvents = spCF.isArray(localScope.eventsList) && localScope.eventsList.length > 0;

    // Get current alerts playbooks
    if (isAlerts) {
        $('.cd-main-content').waitAnimationStart();

        $http({
            method: "GET",
            url: href + '/get-playbook-list-by-alert-ids',
            dataType: "json",
            params: {
                alert_ids: JSON.stringify(localScope.alertsList)
            },
        }).then(function (response) {
            response = response.data || {};
            if (response.success && response.success == true) {
                response = response.data || [];
                if (spCF.isArray(response)) {
                    let currentPlaybooks = [];
                    response.forEach(function (el) {
                        if (spCF.isString(el.id)) {
                            currentPlaybooks.push(el.id);
                        }
                    });

                    currentPlaybooks = currentPlaybooks || [];
                    localScope.fields.forEach(function (field) {
                        if (field.slug && field.slug == 'playbooks') {
                            field.current = currentPlaybooks;
                        }
                    });
                }
            }

            $('.cd-main-content').waitAnimationStop();
        }).catch(function (e) {
            $('.cd-main-content').waitAnimationStop();
            console.log(e);
        });
    }

    // Get same alerts events fields for case
    if (isAlerts || isEvents) {
        $('.cd-main-content').waitAnimationStart();

        let eventsId = isAlerts ? localScope.alertsList : localScope.eventsList;
        $http({
            method: "GET",
            url: href + '/get-same-alerts-events-fields-for-case',
            dataType: "json",
            params: {
                ids: JSON.stringify(eventsId),
                isAlerts: isAlerts
            },
        }).then(function (response) {
                response = response.data || {};
                if (response.success && response.success == true) {
                    response = response.data || {};
                    for (let serverSlug in response) {
                        let fieldWasUsed = false;
                        localScope.fields.forEach(function (field) {
                            if (field.slug && field.slug == serverSlug) {
                                fieldWasUsed = true;
                                if (field.type && field.type == localScope.fieldType.select) {
                                    if (field.list && typeof field.list[response[serverSlug]] == 'string') {
                                        field.current = [response[serverSlug]];
                                    }
                                } else {
                                    field.current = response[serverSlug];
                                }
                            }
                        });

                        if (!fieldWasUsed && typeof localScope.formattedEnabledFieldList[serverSlug] == 'string') {
                            localScope.fields.push({
                                name: localScope.formattedEnabledFieldList[serverSlug],
                                slug: serverSlug,
                                current: response[serverSlug],
                                removable: true,
                                type: localScope.fieldType.text,
                            });

                            delete localScope.formattedEnabledFieldList[serverSlug];
                        }
                    }
                }

                $('.cd-main-content').waitAnimationStop();
            }
        ).catch(function (e) {
            $('.cd-main-content').waitAnimationStop();
            console.log(e);
        });
    }

    if (isCase) {
        $('.cd-main-content').waitAnimationStart();

        $http({
            method: "GET",
            url: href + '/cases-one-data',
            dataType: "json",
            params: {
                id: localScope.caseId
            },
        }).then(function (response) {
            response = response.data || {};
            if (response.success && response.success == true) {
                response = response.data || {};
                for (let serverSlug in response) {
                    let fieldWasUsed = false;
                    localScope.fields.forEach(function (field) {
                        if (field.slug && field.slug == serverSlug) {
                            fieldWasUsed = true;
                            if (field.type && field.type == localScope.fieldType.select) {
                                if (field.list && typeof field.list[response[serverSlug]] == 'string') {
                                    field.current = [response[serverSlug]];
                                }
                            } else {
                                field.current = response[serverSlug];
                            }
                        }
                    });

                    if (!fieldWasUsed && typeof localScope.formattedEnabledFieldList[serverSlug] == 'string') {
                        localScope.fields.push({
                            name: localScope.formattedEnabledFieldList[serverSlug],
                            slug: serverSlug,
                            current: response[serverSlug],
                            removable: true,
                            type: localScope.fieldType.text,
                        });

                        delete localScope.formattedEnabledFieldList[serverSlug];
                    }
                }
            }

            $('.cd-main-content').waitAnimationStop();
        }).catch(function (e) {
            $('.cd-main-content').waitAnimationStop();
            console.log(e);
        });
    }
};