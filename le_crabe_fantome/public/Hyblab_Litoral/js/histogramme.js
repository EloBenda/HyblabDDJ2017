var svg = d3.select("#histogramme"),
    margin = {top: 20, right: 20, bottom: 12 , left: 40},
    width = parseInt(d3.select("#histogramme").style("width")) - margin.left - margin.right,
    height = parseInt(d3.select("#histogramme").style("height")) - margin.bottom - margin.top;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);
y = d3.scale.linear().rangeRound([height, 0]);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("data/data.tsv", function(d) {
    d.frequency = +d.frequency;
    return d;
}, function(error, data) {
    if (error) throw error;

    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis()
            .scale(x)
            .orient("bottom"));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.svg.axis()
            .scale(y)
            .orient("left").ticks(10, "%"))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Taux");

    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("y", function(d) { return y(d.frequency); })
        .attr("width", x.rangeBand())
        .attr("height", function(d) { return height - y(d.frequency) - margin.bottom - margin.top; });
});
