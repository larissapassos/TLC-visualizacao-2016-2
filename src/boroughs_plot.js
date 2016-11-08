var mapSvg;
var mapG;
var width = 860,
    height = 600,
    nyc_geojson_path = "../data/boroughs.geojson",
    featureColl = {},
    scale0 = 50000,
    tau = 2 * Math.PI;

var allPoints;

var projection = d3.geoMercator()
    .center([-74.55, 40.95])
    .scale(scale0)
    .translate([0, 0]);

var path = d3.geoPath()
    .projection(projection)
    .pointRadius(.7);

var zoomed = function() {
    var transform = d3.event.transform;
    projection.scale(transform.k * scale0)
        .translate([transform.x, transform.y]);
    d3.selectAll("path").attr("d", path)
}

var zoom = d3.zoom()
    .scaleExtent([.8, 5])
    .on("zoom", zoomed);

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
    mapSVG = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "boroughs");
    
    var brush = d3.brush()
                    .extent([[0, 0], [width, height]])
                    .on("start", brushstart)
                    .on("end", brushend);

    mapG = mapSVG.append("g").attr("class", "map").attr("id", "map").call(brush);
}

var centered;
var clicked = function(d) {
    var x, y, k;

    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
    } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
    }

    mapG.selectAll("#nyc-state")
        .classed("active", centered && function(d) {return d === centered; });

    mapG.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
}

function loadMap(){
    d3.json(nyc_geojson_path, function(error, nycGeoJson) {
        mapG.selectAll("#nyc-state")
            .data(nycGeoJson.features)
            .enter()
            .append("path")
            .attr("id", "nyc-state")
            .attr("d", path)
            .on("click", clicked);
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
       var bind = mapG.selectAll("#taxi-spot")
                    .data(allPoints);
        
        bind.enter()
            .append("path")
            .attr("d", path)
            .attr("id", "taxi-spot")
            .style("fill", colorPoints)
            .style("fill-opacity", ".2");
        
        bind.exit()
            .remove();
            
        bind.attr("d", path)
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