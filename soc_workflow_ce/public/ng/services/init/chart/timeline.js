require('ui/modules').get('app/soc_workflow_ce', []).service('spInitChartTimeline', [
    function () {
        return function (chartSelector, chartSrc, chartObj) {
            chartSelector = chartSelector || '';
            let chart = {
                data: chartSrc.data || [],
                dataGroups: chartSrc.dataGroups || [],
                colors: chartSrc.colors || []
            };

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
                    axisXTickFormat: '%Y %b %d',
                    axisXTickFit: true,
                    legendShow: true,
                    paddingLeft: 55,
                    paddingRight: 20,
                    paddingTop: 10,
                    showTooltipCategoryName: true,
                    showTooltipColor: true,
                    showTooltipCategoryValue: true,
                    axisYTickOnlyInteger: true,
                    absTooltipCategoryValue: true
                });
            } catch (e) {
                console.log(e);
            }

            return chartObj;
        };
    }]);
