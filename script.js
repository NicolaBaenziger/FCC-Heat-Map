// Define the dimensions and margins for the heatmap and legend
const width = 1200;
const height = 400;
const margin = {
    top: 50,
    right: 50,
    bottom: 100,
    left: 100
};

// Load the data from the JSON file
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").then(data => {
    // Extract the relevant data from the JSON
    const baseTemperature = data.baseTemperature;
    const monthlyData = data.monthlyVariance;

    // Create a function to parse date strings in the dataset
    const parseYearMonth = d3.timeParse("%Y-%m");

    // Define the x and y scales for the heatmap
    const xScale = d3.scaleTime()
        .domain([d3.min(monthlyData, d => parseYearMonth(d.year + "-" + (d.month < 10 ? "0" : "") + d.month)), d3.max(monthlyData, d => parseYearMonth(d.year + "-" + (d.month < 10 ? "0" : "") + d.month))])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(monthlyData.map(d => d.month))
        .range([0, height]);

    // Define color scale for the heatmap
    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
        .domain([d3.min(monthlyData, d => d.variance), d3.max(monthlyData, d => d.variance)]);

    // Create the heatmap
    const svg = d3.select("#heatmap-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.selectAll(".cell")
        .data(monthlyData)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", d => xScale(parseYearMonth(d.year + "-" + (d.month < 10 ? "0" : "") + d.month)))
        .attr("y", d => yScale(d.month))
        .attr("width", width / (monthlyData.length / 12))
        .attr("height", height / 12)
        .style("fill", d => colorScale(d.variance))
        .attr("data-year", d => d.year)
        .attr("data-month", d => d.month)
        .attr("data-temp", d => baseTemperature + d.variance)
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    // Create the x-axis
    const xAxis = d3.axisBottom(xScale).ticks(20).tickFormat(d3.timeFormat("%Y"));
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Create the y-axis with full month names
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const yAxis = d3.axisLeft(yScale)
        .tickValues(monthNames)
        .tickFormat((d, i) => monthNames[i]);
    svg.append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    // Create the legend
    const legendWidth = 400;
    const legendHeight = 30;
    const legendScale = d3.scaleLinear()
        .domain([d3.min(monthlyData, d => d.variance), d3.max(monthlyData, d => d.variance)])
        .range([0, legendWidth]);

    const legendX = d3.scaleLinear()
        .domain([d3.min(monthlyData, d => d.variance), d3.max(monthlyData, d => d.variance)])
        .range([0, legendWidth]);

    const legend = d3.select("#legend-container")
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", legendHeight);

    const legendAxis = d3.axisBottom(legendScale)
        .tickSize(10)
        .tickValues(d3.range(d3.min(monthlyData, d => d.variance), d3.max(monthlyData, d => d.variance), (d3.max(monthlyData, d => d.variance) - d3.min(monthlyData, d => d.variance)) / 4))
        .tickFormat(d3.format(".1f"));

    legend.append("g")
        .attr("id", "legend")
        .call(legendAxis);

    legend.selectAll(".legend-cell")
        .data(d3.range(d3.min(monthlyData, d => d.variance), d3.max(monthlyData, d => d.variance), (d3.max(monthlyData, d => d.variance) - d3.min(monthlyData, d => d.variance)) / 4))
        .enter()
        .append("rect")
        .attr("class", "legend-cell")
        .attr("x", d => legendX(d))
        .attr("y", 10)
        .attr("width", legendWidth / 4)
        .attr("height", legendHeight)
        .style("fill", d => colorScale(d));
    
    // Create and show tooltips
    function showTooltip(d) {
        const tooltip = d3.select("#tooltip");
        tooltip.style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 30) + "px")
            .attr("data-year", d.year)
            .html(
                d3.timeFormat("%Y - %B")(parseYearMonth(d.year + "-" + (d.month < 10 ? "0" : "") + d.month)) +
                "<br>Temperature: " + (baseTemperature + d.variance).toFixed(2) + " &#8451;<br>Variance: " + d.variance.toFixed(2) + " &#8451;"
            );
        tooltip.classed("hidden", false);
    }

    function hideTooltip() {
        const tooltip = d3.select("#tooltip");
        tooltip.classed("hidden", true);
    }
});
