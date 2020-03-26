require('ui/modules').get('app/soc_workflow_ce', []).service('spInitChartTimeline', [
    'spCF',
    function (spCF) {
        return function (chartSelector, chartSrc, chartObj, axisXTickFormat, axisYTickOnlyInteger) {
            axisYTickOnlyInteger = axisYTickOnlyInteger !== false;
            chartSelector = chartSelector || '';
            let chart = {
                data: chartSrc.data || [],
                dataGroups: chartSrc.dataGroups || [],
                colors: chartSrc.colors || []
            };

            axisXTickFormat = spCF.isString(axisXTickFormat) ? axisXTickFormat : '%Y %b %d';

            try {
                chartObj = $(chartSelector).createChart({
                    selector: chartSelector,
                    dataRows: chart.data,
                    dataX: 'date',
                    dataXFormat: '%Y-%m-%d',
                    dataGroups: [
                        chart.dataGroups
                    ],
                    noData: 'No Data',
                    sizeHeight: 400,
                    colorPattern: chart.colors,
                    axisXType: 'timeseries',
                    axisXTickFormat: axisXTickFormat,
                    axisXTickFit: true,
                    legendShow: true,
                    paddingLeft: 55,
                    paddingRight: 20,
                    paddingTop: 10,
                    showTooltipCategoryName: true,
                    showTooltipColor: true,
                    showTooltipCategoryValue: true,
                    axisYTickOnlyInteger: axisYTickOnlyInteger,
                    absTooltipCategoryValue: true
                });
            } catch (e) {
                console.log(e);
            }

            return chartObj;
        };
    }]);
