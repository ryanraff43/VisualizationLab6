export default function StackedAreaChart(container) {
    // initialization
    let selected = null,
        xDomain, data;

    // create svg with margin convention
    const margin = {
            top: 20,
            right: 30,
            bottom: 30,
            left: 50
        },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const svg = d3
        .select(container)
        .append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const group = svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // create scales without domains
    const xScale = d3
        .scaleTime()
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .range([height, 0]);

    const cScale = d3
        .scaleOrdinal()
        .range(d3.schemeTableau10);


    // create axes and axis title containers
    const xAxis = d3
        .axisBottom()
        .scale(xScale);

    const yAxis = d3
        .axisLeft()
        .scale(yScale);

    let xDisplay = group
        .append('g')
        .attr('class', 'axis x-axis');

    let yDisplay = group
        .append('g')
        .attr('class', 'axis y-axis');

    const tooltip = svg
        .append('text')
        .attr('x', 60)
        .attr('y', 20)
        .style('font-size', 12)
        .style('font-style', 'san-serif')
        .style('font-weight', 'bolder');

    // on & listener
    const listeners = {
        zoomed: null
    };

    function on(event, listener) {
        listeners[event] = listener;
    }

    // zoom
    group
        .call(d3.zoom()
            .extent([
                [0, 0],
                [width, height]
            ])
            .translateExtent([
                [0, -Infinity],
                [width, Infinity]
            ]) // we don't care the y-extent
            .scaleExtent([1, 4])
            .on("zoom", zoomed)
        );

    function zoomed({
        transform
    }) {
        const copy = xScale.copy().domain(
            d3.extent(data, (d) => d.date)
        );
        const rescaled = transform.rescaleX(copy);
        xDomain = rescaled.domain();
        update(data);
        if (listeners['zoomed']) {
            listeners['zoomed'](xDomain);
        }
    }

    // clip for stacked chart
    group
        .append('clipPath')
        .attr('id', 'clip-area')
        .append('rect')
        .attr('width', width)
        .attr('height', height);

    // update
    function update(_data) {
        data = _data;
        const keys = selected ? [selected] : data.columns.slice(1);

        let stack = d3
            .stack()
            .keys(keys)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        let stackedData = stack(data);
        // update scales, encodings, axes (use the total count)
        xScale.domain(xDomain ? xDomain : d3.extent(data, (d) => d.date));
        yScale.domain([0, d3.max(stackedData, (a) => d3.max(a, (d) => d[1]))]);
        cScale.domain(keys);

        xDisplay
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

        yDisplay
            .call(yAxis);

        let area = d3
            .area()
            .x((d) => xScale(d.data.date))
            .y1((d) => yScale(d[1]))
            .y0((d) => yScale(d[0]));

        const areas = group.selectAll('.area')
            .data(stackedData, (d) => d.key);

        areas
            .enter()
            .append('path')
            .style('clip-path', 'url(#clip-area)')
            .attr('class', 'area')
            .merge(areas)
            .attr('d', area)
            .style('fill', (d) => cScale(d.key))
            .on('mouseover', (event, d, i) => tooltip.text(d.key))
            .on('mouseout', (event, d, i) => tooltip.text(''))
            .on('click', (event, d) => {
                if (selected === d.key) {
                    selected = null;
                } else {
                    selected = d.key;
                }
                update(data);
            });



        areas
            .exit()
            .remove();
    }

    function filterByDate(range) {
        xDomain = range;
        update(data);
    }

    return {
        update,
        filterByDate,
        on
    };
}