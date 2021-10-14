export default function AreaChart(container) {

    // initialization
    // create svg with margin convention
    const margin = {
            top: 20,
            right: 30,
            bottom: 30,
            left: 50
        },
        width = 600 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    let svg = d3
        .select(container)
        .append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    let group = svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // create scales without domains
    let xScale = d3.scaleTime()
        .range([0, width]);

    let yScale = d3.scaleLinear()
        .range([height, 0]);

    //path
    group.append('path')
        .attr('class', 'area');

    // create axes and axis title containers
    const xAxis = d3.axisBottom()
        .scale(xScale);

    const yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(4);

    let xDisplay = group
        .append('g')
        .attr('class', 'axis x-axis');

    let yDisplay = group
        .append('g')
        .attr('class', 'axis y-axis');

    // on & listener
    const listeners = {
        brushed: null
    };

    function on(event, listener) {
        listeners[event] = listener;
    }

    // brush
    const brush = d3
        .brushX()
        .extent([
            [0, 0],
            [width, height]
        ])
        .on('brush', brushed)
        .on('end', brushended);

    group.append("g").attr('class', 'brush').call(brush);

    function brushed(event) {
        const dataRange = event.selection.map(xScale.invert);

        if (event.selection) {
            listeners["brushed"](dataRange);
        }
    }

    function brushended(event) {
        const dataRange = [xScale.invert(0), xScale.invert(width)];
        if (!event.selection) {
            listeners['brushed'](dataRange);
        }
    }

    function setBrush(timeRange) {
        let range = timeRange.map(xScale);
        group
            .select(".brush")
            .call(brush.move, range);
    }



    function update(data) {

        // update scales, encodings, axes (use the total count)
        xScale.domain(d3.extent(data, (d) => d.date));
        yScale.domain([0, d3.max(data, (d) => d.total)]);

        xDisplay
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

        yDisplay
            .call(yAxis);


        let area = d3.area()
            .x(d => xScale(d.date))
            .y1(d => yScale(d.total))
            .y0(() => yScale.range()[0]);

        d3.select('.area')
            .datum(data)
            .attr('fill', "#1f77b4")
            .attr('d', area);

    }

    return {
        update,
        on,
        setBrush
    };

}