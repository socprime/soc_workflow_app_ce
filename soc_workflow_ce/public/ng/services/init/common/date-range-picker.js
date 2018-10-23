import moment from 'moment';

require('daterangepicker');
require('jquery.cookie');

const defaultRange = {
    'Today': [moment().startOf('day'), moment().endOf('day')],
    'Yesterday': [moment().startOf('day').subtract(1, 'days'), moment().endOf('day').subtract(1, 'days')],
    'Last 7 Days': [moment().startOf('day').subtract(6, 'days'), moment().endOf('day')],
    'Last 30 Days': [moment().startOf('day').subtract(29, 'days'), moment().endOf('day')],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
};

/**
 * @param cookieFrom
 * @param cookieTo
 * @param format
 * @returns {{from: moment.Moment, to: *|moment.Moment}}
 */
const getPeriodByCookiesName = function (cookieFrom, cookieTo, format) {
    format = format || 'X';

    let range = {
        from: moment().subtract(29, 'days'),
        to: moment()
    };

    if (typeof cookieFrom == "string" && typeof cookieTo == "string") {
        let rangeFrom = $.cookie(cookieFrom);
        let rangeTo = $.cookie(cookieTo);

        if (rangeFrom && rangeTo) {
            let defaultRangeList = Object.keys(defaultRange);
            if (defaultRangeList.includes(rangeFrom) && Array.isArray(defaultRange[rangeFrom])) {
                range.from = defaultRange[rangeFrom][0] || range.from;
                range.to = defaultRange[rangeFrom][1] || range.to;
                range.name = rangeFrom;
            } else {
                range.from = moment(rangeFrom, format);
                range.to = moment(rangeTo, format);
            }
        }
    }

    return range;
};

/**
 * @param selector
 * @param start
 * @param end
 * @param title
 * @param dateFormat
 */
const updatePickerTitle = function (selector, start, end, title, dateFormat) {
    let titleSpan = '';
    if (Object.keys(defaultRange).includes(title)) {
        titleSpan = title;
    } else {
        titleSpan = start.format(dateFormat) + ' - ' + end.format(dateFormat);
    }

    if (typeof selector == 'string' && selector.length > 0) {
        $(selector + ' span').html(titleSpan);
    }
};

require('ui/modules').get('app/soc_workflow_ce', []).service('spInitCommonDateRangePicker', [
    '$http',
    'spGetRangeFromPicker',
    function ($http, spGetRangeFromPicker) {
        return function (selector, cookieFrom, cookieTo, options) {
            selector = selector || '';
            cookieFrom = cookieFrom || false;
            cookieTo = cookieTo || false;
            options = options || {};

            let range = getPeriodByCookiesName(cookieFrom, cookieTo, (options.cookieFormat || undefined));

            let defaultOptions = {
                "opens": "left",
                startDate: range.from,
                endDate: range.to,
                applyClass: 'btn btn-sm btn-secondary waves-effect waves-light',
                cancelClass: 'btn btn-sm btn-secondary waves-effect waves-light',
                ranges: defaultRange
            };

            if (typeof options == "object") {
                defaultOptions = $.extend({}, defaultOptions, options);
            }

            let dateFormat = 'MMMM D, YYYY';
            try {
                dateFormat = defaultOptions.locale.format;
            } catch (e) {
            }

            try {
                updatePickerTitle(selector, defaultOptions.startDate, defaultOptions.endDate, (range.name || null), dateFormat);
            } catch (e) {
            }
            try {
                $(selector).daterangepicker(defaultOptions, function (rangeFrom, rangeTo, rangeTitle) {
                    updatePickerTitle(selector, rangeFrom, rangeTo, rangeTitle, dateFormat);
                });
            } catch (e) {
            }

            $(selector).on('apply.daterangepicker', function (ev, picker) {
                let dateRange = {
                    from: 0,
                    to: 0
                };

                let defaultRangeList = Object.keys(defaultRange);
                let currRange = $(selector).data('daterangepicker').chosenLabel;

                if (defaultRangeList.includes(currRange) && Array.isArray(defaultRange[currRange])) {
                    dateRange.from = currRange;
                    dateRange.to = currRange;
                } else {
                    dateRange = spGetRangeFromPicker(selector, (typeof options.cookieFormat == 'string' && options.cookieFormat == 'x'));
                }

                if (cookieFrom && cookieTo) {
                    $.cookie(cookieFrom, dateRange.from, {expires: 365, path: '/'});
                    $.cookie(cookieTo, dateRange.to, {expires: 365, path: '/'});
                }
            });
        };
    }]);
