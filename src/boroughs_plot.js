var mapSvg;
var width = 960,
    height = 500,
    featureColl = {};

var allPoints;

var projection = d3.geoMercator()
    .center([-73.94, 40.70])
    .scale(50000)
    .translate([(width) / 2, (height)/2]);

var path = d3.geoPath()
    .projection(projection)
    .pointRadius(.7);

function toGeoJSON(datum, key) {
    var lat = datum[key == "pickup" ? PICK_LAT : DROP_LAT],
        lng = datum[key == "pickup" ? PICK_LNG : DROP_LNG];

    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lng, lat, 0.0]},
        "properties": {"type": key}
    };
}

function brushstart() {
    selectedRect = undefined;
    console.log("startBrushing");
}

function brushend() {
    if (d3.event.selection != null) {
        var rect = d3.event.selection.map(projection.invert);
        console.log(rect);

        filterPoints(allPoints, rect);
        redraw();    
    }
}

function initSVG(){
    mapSvg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "boroughs");
    
    var brush = d3.brush()
                    .extent([[0, 0], [width, height]])
                    .on("start", brushstart)
                    .on("end", brushend);
    
    mapSvg = mapSvg.append("g")
            .attr("class", "brush")
            .call(brush);
}

function loadMap(){
    d3.json("../data/boroughs.geojson", function(error, nycGeoJson) {
        var group = mapSvg.append("g")
            .attr("class", "g-1");

        group.append("g")
            .attr("class", "boroughs")
            .selectAll(".state")
            .data(nycGeoJson.features)
            .enter()
            .append("path")
            .attr("class", function(d){ return d.properties.name; })
            .attr("d", path)
            .style("stroke", "black")
            .style("stroke-width", ".5px")
            .style("fill-opacity", ".1");

        console.log(nycGeoJson);
    });
}

function colorPoints(d) {
    if (selectedRect.indexOf(d) > -1) {
        return d.properties.type == "pickup" ? "blue" : "green"
    } else {
        return "gray";
    }
}

function plotPoints() {
    if (selectedRect) {
       var bind = d3.select(".tlc")
                    .selectAll("path.point")
                    .data(allPoints);
        
        bind.enter()
            .append("path")
            .attr("d", path)
            .attr("class", "point")
            .style("fill", colorPoints)
            .style("fill-opacity", ".2");
        
        bind.exit()
            .remove();
            
        bind.attr("d", path)
            .attr("class", "point")
            .style("fill", colorPoints)
            .style("fill-opacity", ".2");
    }
}

function loadTaxiSpots(){
    if (!loaded) {
        d3.csv("../assets/tlc/green/subset.csv", function(error, tlc){
            if(!loaded) {
                loaded = true;
                selectedRect = [];

                tlc.slice(1, tlc.length).forEach(function(datum){
                    selectedRect.push(toGeoJSON(datum, "pickup"));
                    selectedRect.push(toGeoJSON(datum, "dropoff"));
                })

                allPoints = selectedRect.slice();
                loadedData = tlc.slice(1, tlc.length);
                
                d3.select(".g-1")
                    .append("g")
                    .attr("class", "tlc")
                
                plotPoints();
            }
        });
    } else {
        if (selectedRect) {
            plotPoints();
        }
    }
}

function initMap(){
    initSVG();
    loadMap();
    loadTaxiSpots();
}

function redraw() {
    plotPoints();
    renderHistogram();
    renderLineChart();
}

function init() {
    initMap();
    initHist();
    initLinePlot();
}

init();