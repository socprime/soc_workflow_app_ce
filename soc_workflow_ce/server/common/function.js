let moment = require('moment-timezone');
let fs = require('fs');
let path = require("path");

const moduleFolder = require('./../constant/module-folder');
const getStage = require(`./../../${moduleFolder}/server/models/stage/get`);

let functions = {
    getCommonSettings: function () {
        return {
            'risk_score_entity_alerts_stacking_fields': ["message"],
            'risk_score_entity_alerts_stacking_fields_timeline': ["message", "user.domain_list"],
            'risk_score_entity_alerts_stacking_fields_timeline_period': 15 * 60 * 1000,
        };
    },
    getArrayOrEmpty: function (value) {
        return ((obj) => this.isArray(obj) ? obj : [])(value);
    },
    getAllStages: function () {
        let allStages = Object.assign({}, getStage.all);

        delete allStages['Open'];
        delete allStages['Queued'];
        delete allStages['In Case'];

        return Object.keys(allStages);
    },
    getAlertStage: function () {
        return getStage.forAlert;
    },
    getCaseClosedStage: function () {
        return getStage.forCaseClosed;
    },
    getAlertClosedStage: function () {
        return getStage.forAlertClosed;
    },
    getCaseStage: function () {
        return getStage.forCase;
    },
    getCaseAvailableStage: function (currStage) {
        return getStage.available(currStage);
    },
    getRandomColor: function () {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }

        return color;
    },
    prepareDonutChartData: function (resultTmp, presetColors) {
        let allLabels = Object.keys(resultTmp);
        let presetColorLabels = Object.keys(presetColors);

        for (let allId in allLabels) {
            for (let presetId in presetColorLabels) {
                if (allLabels[allId] !== presetColorLabels[presetId] && allLabels[allId].toLowerCase() === presetColorLabels[presetId].toLowerCase()) {
                    resultTmp[presetColorLabels[presetId]] = resultTmp[allLabels[allId]];
                    delete resultTmp[allLabels[allId]];
                    allLabels[allId] = presetColorLabels[presetId];
                }
            }
        }

        let data = [];
        let names = {};
        let colors = [];
        let total = 0;

        if (allLabels && allLabels.length) {
            let eventLabelsTmp = {};

            presetColorLabels.forEach(function (elementLabel) {
                if (allLabels.indexOf(elementLabel) >= 0) {
                    eventLabelsTmp[elementLabel] = resultTmp[elementLabel];
                }
            });

            resultTmp = eventLabelsTmp;
            allLabels = Object.keys(resultTmp);

            Object.keys(resultTmp).map(function (elementLabel, index) {
                let value = parseInt(resultTmp[elementLabel]);

                total += value;

                data.push([elementLabel, value]);
                names[elementLabel] = elementLabel + '(' + value + ')';
                colors.push(((typeof presetColors[elementLabel] != "undefined") ? presetColors[elementLabel] : this.getRandomColor()));
            });
        }

        return {
            data: data,
            names: names,
            colors: colors,
            total: total
        };
    },
    prepareTimelineChartData: function (rawData, dateFrom, dateTo, clientTimezone, globalStages) {
        let dateRange = {};
        let currentDate = moment(dateFrom, 'x').tz(clientTimezone);
        let stopDate = moment(dateTo, 'x').tz(clientTimezone);

        let data = [];
        let dataGroups = [];
        let colors = [];

        while (currentDate <= stopDate) {
            dateRange[moment(currentDate).tz(clientTimezone).format('YYYY-MM-DD')] = {};
            currentDate = moment(currentDate).tz(clientTimezone).add(1, 'days');
        }

        let allLabels = [];

        let presetColorLabels = Object.keys(globalStages);

        rawData.forEach(function (oneStage) {
            let stageName = typeof oneStage['key'] != "undefined" ? oneStage['key'] : false;

            if (stageName) {
                let needStageName = stageName;
                presetColorLabels.forEach(function (label) {
                    needStageName = label.toLowerCase() === stageName.toLowerCase() ? label : needStageName;
                });
                allLabels.push(needStageName);
            }
        });

        presetColorLabels.forEach(function (elementLabel) {
            if (allLabels.indexOf(elementLabel) >= 0) {
                rawData.forEach(function (oneStage) {
                    let stageName = typeof oneStage['key'] != "undefined" ? oneStage['key'] : false;

                    if (stageName.toLowerCase() == elementLabel.toLowerCase()) {
                        let stageDates = false;

                        try {
                            stageDates = oneStage['sales_over_time']['buckets'];
                        } catch (e) {
                            console.log(e);
                        }

                        if (stageName && stageDates) {
                            dataGroups.push(elementLabel);
                            colors.push((typeof globalStages[elementLabel] != "undefined" ? globalStages[elementLabel] : functions.getRandomColor()));

                            stageDates.forEach(function (oneDate) {
                                let dateDate = typeof oneDate['key_as_string'] != "undefined" ? (moment(oneDate['key_as_string'], 'x').tz(clientTimezone).format('YYYY-MM-DD')) : false;
                                let dateCount = typeof oneDate['doc_count'] != "undefined" ? oneDate['doc_count'] : false;
                                if (dateDate && dateCount !== false && typeof dateRange[dateDate] != "undefined") {
                                    dateRange[dateDate][elementLabel] = dateCount;
                                }
                            });
                        }
                    }
                });
            }
        });

        Object.keys(dateRange).map(function (dateKey) {
            let dateValue = dateRange[dateKey];

            if (dateValue) {
                let elementData = [dateKey];

                dataGroups.forEach(function (stageName) {
                    let value = typeof dateValue[stageName] != "undefined" ? dateValue[stageName] : 0;
                    elementData.push(value);
                });

                data.push(elementData);
            }
        });

        let dataTitle = ['date'].concat(dataGroups);
        dataTitle = [dataTitle];

        data = dataTitle.concat(data);

        return {
            data: data,
            dataGroups: dataGroups,
            colors: colors,
        };
    },
    getConfigFile: function (filename) {
        let data = null;
        try {
            data = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/../../config/' + filename), 'utf8'));
        } catch (e) {
            console.log(e);
        }

        return data;
    },
    getCaseEnabledFieldList: function () {
        let data = [];
        try {
            data = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/../../config/case_enabled_field_list.json'), 'utf8'));
        } catch (e) {
            console.log(e);
        }

        return data;
    },
    getAvailablePlaybooksNameByAlertNames: function (server, alertNames) {
        let selectedPlaybooks = [];
        if (alertNames.length) {

            let data = {};
            try {
                data = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/../../config/playbook_alert_links.json'), 'utf8'));
            } catch (e) {
                console.log(e);
                server.log(['info'], ['getAvailablePlaybooksNameByAlertNames', e]);
            }

            alertNames.forEach(function (alertName) {
                try {
                    Object.keys(data).map(function (playbookName) {
                        let alerts = data[playbookName];

                        if (alerts.length) {
                            if (alerts.includes(alertName) && !selectedPlaybooks.includes(playbookName)) {
                                selectedPlaybooks.push(playbookName);
                            }
                        }
                    });
                } catch (e) {
                    console.log(e);
                }
            });
        }

        return selectedPlaybooks;
    },
    getUserListSource: function () {
        let source = 'security';
        try {
            let data = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/../../config/user_source.json'), 'utf8'));
            source = data['user_source'] || source;
        } catch (e) {
            console.log(e);
        }

        return source;
    },
    getRisksBaseFields: function () {
        let data = {};
        try {
            data = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/../../config/risks-forensics-base-fields.json'), 'utf8'));
        } catch (e) {
            console.log(e);
        }

        return {
            cases: this.isArray(data.cases) ? data.cases : [],
            alerts: this.isArray(data.alerts) ? data.alerts : [],
        };
    },
    sortObjectByArray: function (obj, fields) {
        let spCF = this;
        let newObj = {};
        if (spCF.isObject(obj)) {
            obj = spCF.makeFlatListFromObject(obj);
            fields = spCF.isArray(fields) ? fields : [];
            fields.forEach((oneFiled) => {
                if (spCF.isSet(obj[oneFiled])) {
                    newObj[oneFiled] = obj[oneFiled];
                    delete obj[oneFiled];
                }
            });

            for (let fieldName in obj) {
                newObj[fieldName] = obj[fieldName];
            }

            newObj = spCF.makeBulkObjectFromList(newObj);

            return newObj;
        } else {
            return obj;
        }
    },
    createTextLinks: function (text) {
        let result = text;
        try {
            result = (text || "").replace(
                /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
                function (match, space, url) {
                    let hyperlink = url;
                    if (!hyperlink.match('^https?:\/\/')) {
                        hyperlink = 'http://' + hyperlink;
                    }
                    return space + '<a href="' + hyperlink + '" target="_blank">' + url + '</a>';
                }
            );
        } catch (e) {
            console.log(e);
        }

        return result;
    },
    getDateInFormat: function (date, format, alternative, inUtc, clientTimezone) {
        let needDate = '';
        alternative = alternative || '';

        if (inUtc === true) {
            needDate = moment(date).utc().format(format);
        } else if (clientTimezone) {
            needDate = moment(date).tz(clientTimezone).format(format);
        } else {
            needDate = moment(date).format(format);
        }

        if (format == 'x') {
            needDate = parseInt(needDate);
        }
        needDate = (needDate == 'Invalid date') ? alternative : needDate;

        return needDate;
    },
    isSet: function (value) {
        return typeof value != 'undefined';
    },
    isArray: function (value) {
        return typeof value != 'undefined' && Array.isArray(value);
    },
    isObject: function (value) {
        return typeof value == 'object';
    },
    isString: function (value) {
        return typeof value == 'string' && value.length > 0;
    },
    isFunction: function (value) {
        return typeof value == 'function';
    },
    isBool: function (value) {
        return typeof value == 'boolean';
    },
    isNumber: function (value) {
        return typeof value == 'number';
    },
    arrayUnique: function (needArray) {
        let a = needArray.concat();
        for (let i = 0; i < a.length; ++i) {
            for (let j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }

        return a;
    },
    identifyCurrentIndexPattern: function (indexPatterns, index) {
        indexPatterns = functions.isArray(indexPatterns) ? indexPatterns : [];
        let title = '';
        let id = '';

        index = index.split('/');
        index = (index.length > 1) ? index[0] : '';

        indexPatterns.forEach(function (onePattern) {
            let oneId = onePattern.id || null;
            let oneTitle = onePattern.title || null;
            let pattern = oneTitle.replace('*', '.*');
            pattern = new RegExp(pattern);
            if (index.search(pattern) >= 0) {
                title = oneTitle;
                id = oneId;
            }
        });

        return {
            id: id,
            title: title
        };
    },
    slaConfigHasError: function (config) {
        let spCF = this;
        let hasErrors = false;
        ['alert', 'case'].forEach(function (oneConfig) {
            if (spCF.isArray(config[oneConfig])) {
                config[oneConfig].forEach(function (oneRange) {
                    let errorMessage = 'Not specified all data for range!';
                    oneRange.errorMessage = undefined;
                    if (!(
                        spCF.isArray(oneRange.from) && oneRange.from.length > 0 &&
                        spCF.isArray(oneRange.to) && oneRange.to.length > 0 &&
                        spCF.isNumber(oneRange.High) &&
                        spCF.isNumber(oneRange.Medium) &&
                        spCF.isNumber(oneRange.Low) &&
                        spCF.isArray(oneRange.fromEntry) && oneRange.fromEntry.length > 0 &&
                        spCF.isArray(oneRange.toEntry) && oneRange.toEntry.length > 0
                    )) {
                        oneRange.errorMessage = errorMessage;
                        hasErrors = true;
                    }
                });
            }
        });

        return hasErrors;
    },
    makeFlatListFromObject: function (content, nameDotted, fields) {
        nameDotted = this.isSet(nameDotted) ? nameDotted : '';
        fields = this.isSet(fields) ? fields : {};
        let spCF = this;
        if (spCF.isObject(content) && !spCF.isArray(content)) {
            for (let propName in content) {
                fields = spCF.makeFlatListFromObject(content[propName], (nameDotted == '' ? propName : nameDotted + '.' + propName), fields);
            }
        } else {
            fields[nameDotted] = content;
        }

        return fields;
    },
    makeBulkObjectFromList: function (content) {
        let spCF = this;
        let newContent = content;
        if (spCF.isObject(content) && !spCF.isArray(content)) {
            newContent = {};
            for (let fieldName in content) {
                if (fieldName.indexOf('.') >= 0) {
                    let fieldNameArr = fieldName.split('.');
                    let firstFieldName = fieldNameArr[0];
                    fieldNameArr.shift();
                    let fieldInnerName = fieldNameArr.join('.');
                    if (spCF.isSet(newContent[firstFieldName])) {
                        let newInner = {};
                        newInner[fieldInnerName] = content[fieldName];
                        newContent[firstFieldName] = spCF.isObject(newContent[firstFieldName]) ? newContent[firstFieldName] : {0: newContent[firstFieldName]};
                        newContent[firstFieldName] = Object.assign({}, newContent[firstFieldName], newInner);
                    } else {
                        newContent[firstFieldName] = {};
                        newContent[firstFieldName][fieldInnerName] = content[fieldName];
                    }
                } else {
                    newContent[fieldName] = content[fieldName];
                }
            }
            for (let fieldName in newContent) {
                if (spCF.isObject(newContent[fieldName]) && !spCF.isArray(newContent[fieldName])) {
                    newContent[fieldName] = spCF.makeBulkObjectFromList(newContent[fieldName]);
                }
            }
        }

        return newContent;
    },
    getHitsHits: function (response) {
        response = response['hits'] || {};

        return response['hits'] || [];
    },
    extractArrayFromSource: function (array) {
        let spCF = this;
        let response = [];
        if (spCF.isArray(array)) {
            array.forEach(function (el) {
                el._source = el._source || {};
                if (el["_id"]) el._source['id'] = el["_id"];
                if (el["_index"]) el._source['index'] = el["_index"];
                response.push(el._source);
            });
        }

        return response;
    },
    beautifyName: function (name) {
        let spCF = this;
        if (spCF.isString(name)) {
            name = name.replace(/^[0-9\s]+/gui, '');
            name = name.replace(/[_]/gui, ' ');
            name = name.replace('.', ' - ');
            name = name.toLowerCase()
                .split(' ')
                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(' ');
        }

        return name;
    }
};

module.exports = functions;