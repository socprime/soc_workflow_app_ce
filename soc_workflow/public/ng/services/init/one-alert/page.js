import moment from 'moment';

const skipedRightSidebarFields = [
    '@timestamp',
    'timestamp',
    'operator',
    'comment',
    'resource.URL',
    'resource.URI',
    'priority_color',
    'events.id',
    'dateday',
    'available.stage',
    'event.labels',
    'cases',
    'playbooks'
];

require('ui/modules').get('app/soc_workflow', []).service('spInitOneAlertPage', [
    '$http',
    'spCF',
    'spMlIntegrationAdd',
    function ($http, spCF, spMlIntegrationAdd) {
        return function ($scope) {
            $scope.$watch('alertRawData', function (newValue, oldValue) {
                newValue = typeof newValue == 'object' ? newValue : {};

                $scope.alertPlainData = {};
                $scope.alertCustomData = {};
                $scope.alertLinksData = {};

                // Add plain fields
                // Stage
                $scope.alertPlainData['Stage'] = spCF.isString(newValue['event.labels']) ? newValue['event.labels'] : '';
                // Operator
                $scope.alertPlainData['Operator'] = spCF.isString(newValue['operator']) ? newValue['operator'] : 'Not assigned';
                for (let rowKey in newValue) {
                    if (skipedRightSidebarFields.indexOf(rowKey) < 0) {
                        $scope.alertPlainData[rowKey] = newValue[rowKey];
                    }
                }

                // Add custom fields
                // Comment
                $scope.alertCustomData['comment'] = spCF.isString(newValue['comment']) ? newValue['comment'] : '';

                // Priority
                $scope.alertCustomData['priority'] = {
                    color: spCF.isString(newValue['priority_color']) ? newValue['priority_color'] : '',
                    text: spCF.isString(newValue['event.severity']) ? newValue['event.severity'] : '',
                };

                // Tags
                $scope.alertCustomData['tags'] = spCF.isArray(newValue['tags']) ?
                    newValue['tags'] : spCF.isString(newValue['tags']) ?
                        newValue['tags'].split(',') : [];

                // Name with tags - title
                $scope.alertCustomData['title'] = '';
                if ($scope.alertCustomData['tags'].length > 0) {
                    try {
                        $scope.alertCustomData['title'] = $scope.alertCustomData['tags'].join('</span><span class="badge badge-blue-grey m-r-5">');
                    } catch (e) {
                    }

                    let messageText = spCF.isString(newValue['message']) ? newValue['message'] : '';
                    if (messageText.length > 0) {
                        messageText += '<br>';
                    }
                    $scope.alertCustomData['title'] = messageText + '<span class="tags-line"><b class="b-sm">Tags:</b> <span class="badge badge-blue-grey m-r-5">' + $scope.alertCustomData['title'] + '</span></span>';
                }

                // Date
                $scope.alertCustomData['timestamp'] = spCF.getDateInFormat(newValue['@timestamp'], 'YYYY-MM-DD HH:mm:ss.SSS', '');
                $scope.alertCustomData['timestampUtc'] = spCF.getDateInFormat(newValue['@timestamp'], 'YYYY-MM-DD HH:mm:ss.SSS', '', true);

                // Current operator
                $scope.alertCustomData['currentOperator'] = spCF.isString(newValue['operator']) ? 'Assignee: ' + newValue['operator'] : '';

                // Add links fields
                let shorteningLength = 30;

                // ML link
                spMlIntegrationAdd($scope, newValue);

                if (typeof newValue['event.timestamp'] != 'undefined') {
                    $scope.alertPlainData['event.timestamp'] = moment(newValue['event.timestamp']).utc().format('YYYY-MM-DD HH:mm:ss.SSS');
                }

                // Anomali Enterprise
                if (spCF.isString(newValue['type']) && newValue['type'] == 'anomali_enterprise') {
                    if (spCF.isString(newValue['uuid'])) {
                        $scope.alertLinksData['Anomali Enterprise UUID'] = newValue['uuid'];
                    }
                    if (spCF.isString(newValue['event.src'])) {
                        $scope.alertLinksData['Anomali Enterprise Event Source'] = newValue['event.src'];
                    }
                }

                // Anomali Phishing - Email web drilldown
                if (typeof newValue['suspicious_emails_box.url'] == 'string' && newValue['suspicious_emails_box.url'].length > 0) {
                    $scope.alertLinksData['Corporate Email URL'] = '<a href="' + newValue['suspicious_emails_box.url'] + '" target="_blank">' + newValue['suspicious_emails_box.url'] + '</a>';
                }

                //events.id
                if (typeof newValue['events.id'] == 'string') {
                    let events = newValue['events.id'].split(',').map(s => s.trim());

                    if ($scope.currUrl && events.length > 0) {
                        let href = $scope.currUrl.replace('soc_workflow', 'kibana');

                        let baseIndex = '';
                        $scope.allIndexPattern.forEach(function (onePattern) {
                            if (typeof onePattern['id'] == 'string' && typeof onePattern['title'] == 'string' && onePattern['title'] == '*') {
                                baseIndex = onePattern['id'];
                            }
                        });

                        if (baseIndex.length > 0) {
                            baseIndex = ",index:'" + baseIndex + "'";
                        }

                        events = events.join("%22 OR _id:%22", events);
                        events = "_id:%22" + events + "%22";

                        let tmpLinkHref = href + "#/discover?_g=(refreshInterval:(display:Off,pause:!f,value:0))&_a=(columns:!(_source)" + baseIndex + ",interval:auto,query:(language:lucene,query:'" + events + "'),sort:!('@timestamp',desc))";
                        let tmpLink = '<a href="' + tmpLinkHref + '" target="_blank">Events</a>';

                        if (tmpLink.length) {
                            $scope.alertLinksData['events.id'] = tmpLink;
                        }
                    }
                }

                //cases.id
                if (spCF.isArray(newValue['cases'])) {
                    let cases = newValue['cases'];
                    let tpnLinks = [];

                    cases.forEach(function (row) {
                        let id = spCF.isString(row['id']) ? row['id'] : '';
                        let name = spCF.isString(row['name']) ? row['name'] : '';
                        let created = spCF.isString(row['created']) ? row['created'] : '';

                        if (id) {
                            let linkTitle = name + (created ? ' (' + created + ')' : id);
                            let linkText = linkTitle.length > shorteningLength ? linkTitle.substring(0, shorteningLength) + ' ...' : linkTitle;

                            let tmpLink = '<a href="' + ($scope.casesUrl ? $scope.casesUrl + '/' + id : '') + '" title="' + linkTitle + '">' + linkText + '</a>';
                            tpnLinks.push(tmpLink);
                        }
                    });

                    if (tpnLinks.length) {
                        $scope.alertLinksData['cases.id'] = tpnLinks.join('');
                    }
                }

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
                                $scope.alertLinksData['Playbooks'] = tpnLinks.join('');
                            }
                        }
                    } catch (e) {
                    }
                }

                // resource.URL
                if (spCF.isString(newValue['resource.URL'])) {
                    $scope.alertLinksData['Resource.URL'] = '<a href="' + newValue['resource.URL'] + '" target="_blank">' + newValue['resource.URL'] + '</a>';
                }

                // resource.URI
                if (spCF.isString(newValue['resource.URI'])) {
                    $scope.alertLinksData['Resource.URI'] = '<a href="' + newValue['resource.URI'] + '" target="_blank">' + newValue['resource.URI'] + '</a>';
                }
            });

            // Stage log formatting
            $scope.$watch('alertStageLog', function (newValue, oldValue) {
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