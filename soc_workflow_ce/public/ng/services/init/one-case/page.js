const skipedRightSidebarFields = [
    '@timestamp',
    'timestamp',
    'event.labels',
    'comment',
    'resource.URL',
    'resource.URI',
    'url.query',
    'events_id',
    'alerts_id',
    'priority_color',
    'operator',
    'available.stage',
    'dateday',
    'saved-search',
    'graph-workspace',
    'playbooks'
];

require('ui/modules').get('app/soc_workflow_ce', []).service('spInitOneCasePage', [
    '$http',
    'spCF',
    'spGraphIntegrationAdd',
    function ($http, spCF, spGraphIntegrationAdd) {
        return function ($scope) {
            $scope.$watch('caseRawData', function (newValue, oldValue) {
                newValue = typeof newValue == 'object' ? newValue : {};

                $scope.casePlainData = {};
                $scope.caseCustomData = {};
                $scope.caseLinksData = {};

                // Add plain fields
                // Stage
                $scope.casePlainData['Stage'] = spCF.isString(newValue['event.labels']) ? newValue['event.labels'] : '';
                // Operator
                $scope.casePlainData['Operator'] = spCF.isString(newValue['operator']) ? newValue['operator'] : 'Not assigned';
                for (let rowKey in newValue) {
                    if (skipedRightSidebarFields.indexOf(rowKey) < 0) {
                        $scope.casePlainData[rowKey] = newValue[rowKey];
                    }
                }

                // Add custom fields
                // Comment
                $scope.caseCustomData['comment'] = spCF.isString(newValue['comment']) ? newValue['comment'] : '';

                // Priority
                $scope.caseCustomData['priority'] = {
                    color: spCF.isString(newValue['priority_color']) ? newValue['priority_color'] : '',
                    text: spCF.isSet(newValue['event.severity']) ? newValue['event.severity'] : '',
                };

                // Tags
                $scope.caseCustomData['tags'] = spCF.isArray(newValue['tags']) ?
                    newValue['tags'] : spCF.isString(newValue['tags']) ?
                        newValue['tags'].split(',') : [];

                // Name with tags - title
                $scope.caseCustomData['title'] = '';
                if ($scope.caseCustomData['tags'].length > 0) {
                    try {
                        $scope.caseCustomData['title'] = $scope.caseCustomData['tags'].join('</span><span class="badge badge-blue-grey m-r-5">');
                    } catch (e) {
                    }

                    let messageText = spCF.isString(newValue['message']) ? newValue['message'] : '';
                    if (messageText.length > 0) {
                        messageText += '<br>';
                    }
                    $scope.caseCustomData['title'] = messageText + '<span class="tags-line"><b class="b-sm">Tags:</b> <span class="badge badge-blue-grey m-r-5">' + $scope.caseCustomData['title'] + '</span></span>';
                }

                // Date
                $scope.caseCustomData['timestamp'] = spCF.getDateInFormat(newValue['@timestamp'], 'YYYY-MM-DD HH:mm:ss.SSS', '');
                $scope.caseCustomData['timestampUtc'] = spCF.getDateInFormat(newValue['@timestamp'], 'YYYY-MM-DD HH:mm:ss.SSS', '', true);

                // Current operator
                $scope.caseCustomData['currentOperator'] = spCF.isString(newValue['operator']) ? 'Assignee: ' + newValue['operator'] : '';

                // Anomali Phishing - Email web drilldown
                if (typeof newValue['suspicious_emails_box.url'] == 'string' && newValue['suspicious_emails_box.url'].length > 0) {
                    $scope.alertLinksData['Corporate Email URL'] = '<a href="' + newValue['suspicious_emails_box.url'] + '" target="_blank">' + newValue['suspicious_emails_box.url'] + '</a>';
                }

                // Add links fields
                let shorteningLength = 30;
                //events_id
                if (typeof newValue['events_id'] == 'object') {
                    let events = newValue['events_id'];
                    let tpnLinks = [];
                    if ($scope.currUrl) {
                        let href = $scope.currUrl.replace('soc_workflow_ce', 'kibana');

                        for (let rowId in events) {
                            let row = events[rowId];
                            let id = spCF.isString(row['id']) ? row['id'] : '';
                            let index = spCF.isString(row['index']) ? row['index'] : '';
                            let name = spCF.isString(row['name']) ? row['name'] : '';
                            let created = spCF.isString(row['created']) ? row['created'] : '';

                            if (id) {
                                let linkTitle = name + ' ' + (created ? '(' + created + ')' : id);
                                let linkText = linkTitle.length > shorteningLength ? linkTitle.substring(0, shorteningLength) + ' ...' : linkTitle;

                                let tmpLinkHref = href + "#/discover?_g=(refreshInterval:(display:Off,pause:!f,value:0))&_a=(columns:!(_source)" + index + ",interval:auto,query:(language:lucene,query:'_id:%22" + id.trim() + "%22'),sort:!('@timestamp',desc))";
                                let tmpLink = '<a href="' + tmpLinkHref + '" target="_blank" title="' + linkTitle + '">' + linkText + '</a>';

                                tpnLinks.push(tmpLink);
                            }
                        }

                        if (tpnLinks.length) {
                            $scope.caseLinksData['events_id'] = tpnLinks.join('');
                        }
                    }
                }

                //alerts_id
                if (typeof newValue['alerts_id'] == 'object') {
                    let alerts = newValue['alerts_id'];
                    let tpnLinks = [];

                    for (let rowId in alerts) {
                        let row = alerts[rowId];
                        let id = spCF.isString(row['id']) ? row['id'] : '';
                        let name = spCF.isString(row['name']) ? row['name'] : '';
                        let created = spCF.isString(row['created']) ? row['created'] : '';

                        if (id) {
                            let linkTitle = name + ' ' + (created ? '(' + created + ')' : id);
                            let linkText = linkTitle.length > shorteningLength ? linkTitle.substring(0, shorteningLength) + ' ...' : linkTitle;

                            let tmpLink = '<a href="' + ($scope.alertsUrl ? $scope.alertsUrl + '/' + id : '') + '" title="' + linkTitle + '">' + linkText + '</a>';
                            tpnLinks.push(tmpLink);
                        }
                    }

                    if (tpnLinks.length) {
                        $scope.caseLinksData['alerts_id'] = tpnLinks.join('');
                    }
                }

                //saved-search
                if (spCF.isString(newValue['saved-search'])) {
                    let savedSearches = [];
                    try {
                        savedSearches = JSON.parse(newValue['saved-search']);
                    } catch (e) {
                    }
                    let href = $scope.currUrl.replace('soc_workflow_ce', 'kibana');
                    let tpnLinks = [];
                    savedSearches.forEach(function (oneSearch) {
                        let id = oneSearch['id'] || '';
                        let name = oneSearch['name'] || '';
                        let dateFrom = oneSearch['date-from'] || '';
                        let dateTo = oneSearch['date-to'] || '';
                        let linkText = name.length > shorteningLength ? name.substring(0, shorteningLength) + ' ...' : name;

                        id = id.replace('search:', '');

                        let tmpLinkHref = href + "#/discover/" + id + "?_g=(time:(from:'" + dateFrom + "',mode:absolute,to:'" + dateTo + "'))";
                        let tmpLink = '<a href="' + tmpLinkHref + '" target="_blank" title="' + name + '">' + linkText + '</a>';

                        tpnLinks.push(tmpLink);
                    });

                    if (tpnLinks.length) {
                        $scope.caseLinksData['Saved Search'] = tpnLinks.join('');
                    }
                }

                // Graph Workspace
                spGraphIntegrationAdd($scope, newValue);

                //playbooks
                if (spCF.isString(newValue['playbooks'])) {
                    let playbooks = newValue['playbooks'];
                    try {
                        let tmpIds = JSON.parse(playbooks);

                        if (tmpIds.length) {
                            let tpnLinks = [];
                            tmpIds.forEach(function (val) {
                                let id = spCF.isString(val['id']) ? val['id'] : '';
                                let name = spCF.isString(val['name']) ? val['name'] : '';

                                let tmpLink = '<a ng-click="showPlaybookModal(\'' + id + '\')" title="' + name + '">' + name + '</a>';
                                tpnLinks.push(tmpLink);
                            });

                            if (tpnLinks.length) {
                                $scope.caseLinksData['Playbooks'] = tpnLinks.join('');
                            }
                        }
                    } catch (e) {
                    }
                }

                // resource.URL
                if (spCF.isString(newValue['resource.URL'])) {
                    $scope.caseLinksData['Resource.URL'] = '<a href="' + newValue['resource.URL'] + '" target="_blank">' + newValue['resource.URL'] + '</a>';
                }

                // resource.URI
                if (spCF.isString(newValue['resource.URI'])) {
                    $scope.caseLinksData['Resource.URI'] = '<a href="' + newValue['resource.URI'] + '" target="_blank">' + newValue['resource.URI'] + '</a>';
                }

                // url.query
                if (spCF.isString(newValue['url.query'])) {
                    $scope.caseLinksData['url.query'] = '<a href="' + newValue['url.query'] + '" target="_blank">' + newValue['url.query'] + '</a>';
                }
            });

            // Stage log formatting
            $scope.$watch('caseStageLog', function (newValue, oldValue) {
                newValue = spCF.isArray(newValue) ? newValue : [];
                newValue.forEach(function (oneLog) {
                    oneLog['operator.action'] = spCF.isString(oneLog['operator.action']) ? ' by <b>' + oneLog['operator.action'] + '</b>' : '';
                    oneLog['stage.now'] = spCF.isString(oneLog['stage.now']) ? oneLog['stage.now'] : '';
                    oneLog['operator.now'] = spCF.isString(oneLog['operator.now']) ? oneLog['operator.now'] : '';
                    oneLog['comment'] = spCF.isString(oneLog['comment']) ? oneLog['comment'] : '';
                });
            });
        };
    }]);

