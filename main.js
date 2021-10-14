import AreaChart from './AreaChart.js';
import StackedAreaChart from './StackedAreaChart.js';

var unemployment;

d3.csv('unemployment.csv', d3.autoType).then(data => {
    unemployment = data;
    console.log('Unemployment', unemployment);
    let row = unemployment.columns.slice(1);
    unemployment.forEach(d => {
        let sum = 0;
        row.forEach(element => sum += d[element]);
        d.total = sum;
    });


    const areaChart1 = AreaChart(".area_chart");
    areaChart1.update(unemployment);
    const areaChart2 = StackedAreaChart(".stacked_chart");
    areaChart2.update(unemployment);

    areaChart1.on("brushed", (range) => {
        areaChart2.filterByDate(range); // coordinating with stackedAreaChart
    });
    areaChart2.on("zoomed", timeRange => {
        areaChart1.setBrush(timeRange);
    });


});