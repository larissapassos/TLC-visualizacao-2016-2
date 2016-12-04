var stackSVG;

stackSvgAttrs = {
    id : "stack",
    width : 400,
    height: 300,
    transform : "translate(" + margin.left + "," + margin.top + ")"
};

var wStack = w - marginHist.left - marginHist.right;
var hStack = h - marginHist.top - marginHist.bottom;

function renderStackChart() {
    var stack = d3.stack();
    var stackDataTmp = selectedData.map(x => [parseFloat(x.Total_amount), parseFloat(x.Tip_amount)])
        .reduce((x, y) => [x[0]+y[0], x[1] + y[1]]);

    var stackData = [{total_amount: stackDataTmp[0], tip_amount: stackDataTmp[1], cab_type: "green"}];

    var xScaleStack = d3.scalePoint()
        .domain(stackData.map(x => x.cab_type))
        .range([0, wStack - marginHist.right]);

    var yScaleStack = d3.scaleLinear()
        .domain([0, d3.max(stackData, d => d.total_amount + d.tip_amount)])
        .range([hStack, 0]);

    var colorScaleStack = d3.scaleOrdinal()
        .domain(stackData.map(x => x.cab_type))
        .range(["#98abc5", "#ff8c00"]);

    var stackBind = stackSVG.selectAll(".stackGroup")
        .data(stack.keys(["total_amount", "tip_amount"])(stackData));

    var xAxisStack = d3.axisBottom(xScaleStack);
    var yAxisStack = d3.axisLeft(yScaleStack);

    stackSVG.select("#xAxisStack").transition().call(xAxisStack);
    stackSVG.select("#yAxisStack").transition().call(yAxisStack);

    stackBind
        .enter().append("g")
            .attr("class", "stackGroup")
            .attr("fill", function(d){ return colorScaleStack(d.key); })
        .selectAll("rect")
        .data(function(d){ return d; })
        .enter().append("rect")
            .attr("x", function(d) { return xScaleStack(d.cab_type); })
            .attr("y", function(d){ return yScaleStack(d[1]); })
            .attr("height", function(d){ return yScaleStack(d[0]) - yScaleStack(d[1]); })
            .attr("width", 30);

}

function readCsvStack() {
    if (!loaded) {
        d3.csv(csv_path, function(data) {
            loadedData = data.slice(1, data.length);
            selectedData = loadedData.slice();
            loaded = true;
            renderStackChart();
        });
    }
}

function initStackedBarSVG() {
    stackSVG = d3.select("#views").append("svg").attrs(stackSvgAttrs);

    stackSVG.append("g").attr("id","xAxisStack")
        .attr("transform","translate(" + 0 + "," + hStack + ")");
//histSvg.append("g").attr("id","xAxisHist").attr("transform","translate(0," + hHist + ")")
    stackSVG.append("g").attr("id","yAxisStack")
        .attr("transform","translate(" + (padding.inner + margin.left) + ",0)");
}

function initStackedBarPlot() {
    initStackedBarSVG();
    readCsvStack();
}

// {
//     "region": {"lat_min": 0, "lat_max": 0, "lng_min": 0, "lng_max": 0},
//     "pickups": 0,
//     "dropoffs":0,
//     "pickups_hour":[...],
//     "pickups_day_week":[...],
//     "pickups_day_month":[...],
//     "average_price":0.00,
//     "average_tip":0.00
// }
