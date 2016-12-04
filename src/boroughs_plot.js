var leaflet;
var leafletSvg;
var leafletG;

var featureColl = {},
    scale0 = 50000,
    tau = 2.0 * Math.PI;

var allPointsGeoJSON;
var taxiSpotsLeaflet;
var path;

function toGeoJSON(datum, key) {
    var lat = datum[key == "pickup" ? PICK_LAT : DROP_LAT],
        lng = datum[key == "pickup" ? PICK_LNG : DROP_LNG];

    if (lat == 0.0 || lng == 0.0) {
        console.log(datum)
    }
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lng, lat]},
        "properties": {"type": key}
    };
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
       var bind = leafletG.selectAll("#taxi-spot")
                    .data(allPointsGeoJSON);

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
        d3.csv("../assets/tlc/green/subset2.csv", function(error, tlc){
            if (error) throw error;
            if(!loaded) {
                loaded = true;
                selectedRect = [];

                tlc.slice(1, tlc.length).forEach(function(datum){
                    selectedRect.push(toGeoJSON(datum, "pickup"));
                    selectedRect.push(toGeoJSON(datum, "dropoff"));
                })

                allPointsGeoJSON = selectedRect.slice();
                loadedData = tlc.slice(1, tlc.length);
                       
                var transform = d3.geoTransform({point: projectPoint});
                path = d3.geoPath().projection(transform);

                taxiSpotsLeaflet = leafletG.selectAll("#taxi-spot")
                                           .data(allPointsGeoJSON)
                                           .enter()
                                           .append("path")
                                           .attr("id", "taxi-spot")
                                           .style("fill", colorPoints)
                                           .style("fill-opacity", ".2");

                leaflet.on("zoomend", updateLeaflet);
                updateLeaflet();

                // Local auxiliary functions
                function projectPoint(x, y) {
                    var point = leaflet.latLngToLayerPoint(new L.LatLng(y, x));
                    this.stream.point(point.x, point.y);
                }

                function updateLeaflet() {
                    var bounds = getBounds(),
                        topLeft = bounds[0],
                        bottomRight = bounds[1];

                    leafletSvg.attrs({
                        width : bottomRight[0] - topLeft[0],
                        height : bottomRight[1] - topLeft[1]
                    })
                    .style("left", topLeft[0] + "px")
                    .style("top", topLeft[1] + "px")

                    leafletG.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
                    taxiSpotsLeaflet.attr("d", path);
                }

                function getBounds() {
                    var finalBounds = [[Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY], 
                                       [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]];
                    allPointsGeoJSON.forEach(function(p) {
                        var b = path.bounds(p);
                        finalBounds[0][0] = Math.min(finalBounds[0][0], b[0][0]);
                        finalBounds[0][1] = Math.min(finalBounds[0][1], b[0][1]);
                        finalBounds[1][0] = Math.max(finalBounds[1][0], b[1][0]);
                        finalBounds[1][1] = Math.max(finalBounds[1][1], b[1][1]);
                    })
                    return finalBounds;
                }
            }
        });
    }
}

function loadLeaflet() {
    leaflet = new L.Map("leaflet", {center: [40.730610, -73.935242], zoom: 12, selectArea: true})
                   .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
    mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; ' + mapLink + ' Contributors', maxZoom: 18,
     }).addTo(leaflet);

    leaflet.on('areaselected', (e) => {
        var arr = [[e.bounds._southWest.lng, e.bounds._northEast.lat], [e.bounds._northEast.lng, e.bounds._southWest.lat]];
        filterPoints(allPointsGeoJSON, arr);
        redraw();

        function redraw() {
            plotPoints();
            renderHistogram();
            renderLineChart();
        }
    });

    leafletSvg = d3.select(leaflet.getPanes().overlayPane).append("svg");
    leafletG = leafletSvg.append("g").attr("class", "leaflet-zoom-hide");
}

function initMap() {
    loadLeaflet();
    loadTaxiSpots();
}

function init() {
    initMap();
    initHist();
    initLinePlot();
}

init();