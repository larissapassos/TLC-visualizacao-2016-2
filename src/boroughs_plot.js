var leaflet;
var leafletSvg;
var leafletG;

var featureColl = {},
    scale0 = 50000,
    tau = 2.0 * Math.PI;

var allPointsGeoJSON;
var filteredPointsGeoJSON = [];
var taxiSpotsLeaflet;
var path;

var chosenTripCategory = "pickups";

function toGeoJSON(datum) {
    var lat_min = datum.region.lat_min,
        lat_max = datum.region.lat_max,
        lng_min = datum.region.lng_min,
        lng_max = datum.region.lng_max;

    var pickups = datum.pickups ? datum.pickups : 0;
    var dropoffs = datum.dropoffs ? datum.dropoffs : 0;

    return {
        "type": "Feature",
        "geometry": {"type": "Polygon", "coordinates": [
            [ [lng_min, lat_min],
            [lng_min, lat_max],
            [lng_max, lat_max],
            [lng_max, lat_min],
            [lng_min, lat_min] ]
        ]},
        "properties": { 
            "pickups" : pickups,
            "dropoffs" : dropoffs
        }
    };
}

function colorPoints(d) {
    return "red";
}

function plotPoints() {
    if (selectedRect) {
       var bind = leafletG.selectAll("#taxi-spot")
                    .data(filteredPointsGeoJSON);

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

function filterPointsByTripCategory() {
    filteredPointsGeoJSON = [];
    allPointsGeoJSON.forEach(function(p) {
        if (p["properties"][chosenTripCategory] > 0) {
            filteredPointsGeoJSON.push(p);
        }
    })
}

function checkRadio() {
    d3.selectAll("[name=trip_category]")
      .on("change", change);

    function change() {
        chosenTripCategory = this.value;
        filterPointsByTripCategory();
        drawTaxiSpots();
    }
}

function drawTaxiSpots() {
    leafletG.selectAll("#taxi-spot")
            .remove();

    taxiSpotsLeaflet = leafletG.selectAll("#taxi-spot")
                               .data(filteredPointsGeoJSON)
                               .enter()
                               .append("path")
                               .attr("id", "taxi-spot")
                               .style("fill", colorPoints)
                               .style("fill-opacity", ".2");
    updateLeaflet();
}

function loadTaxiSpots() {
    if (!loaded) {
        d3.json("../assets/tlc/green/green.json", function(error, tlc) {
            if (error) throw error;
            loaded = true;
            selectedRect = [];

            tlc.slice(1, tlc.length).forEach(function(datum){
                selectedRect.push(toGeoJSON(datum));
                selectedRect.push(toGeoJSON(datum));
            })

            allPointsGeoJSON = selectedRect.slice();
            loadedData = tlc.slice(1, tlc.length);
            filterPointsByTripCategory();

            var transform = d3.geoTransform({point: projectPoint});
            path = d3.geoPath().projection(transform);

            leaflet.on("zoomend", updateLeaflet);
            drawTaxiSpots();
        });
    }
}

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
    filteredPointsGeoJSON.forEach(function(p) {
        var b = path.bounds(p);
        finalBounds[0][0] = Math.min(finalBounds[0][0], b[0][0]);
        finalBounds[0][1] = Math.min(finalBounds[0][1], b[0][1]);
        finalBounds[1][0] = Math.max(finalBounds[1][0], b[1][0]);
        finalBounds[1][1] = Math.max(finalBounds[1][1], b[1][1]);
    })
    return finalBounds;
}

function loadLeaflet() {
    leaflet = new L.Map("leaflet", {center: [40.730610, -73.935242], zoom: 11, selectArea: true})
                   .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
    mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; ' + mapLink + ' Contributors', maxZoom: 18,
     }).addTo(leaflet);

    leaflet.on('areaselected', (e) => {
        var arr = [[e.bounds._southWest.lng, e.bounds._northEast.lat], [e.bounds._northEast.lng, e.bounds._southWest.lat]];
        filterPoints(filteredPointsGeoJSON, arr);
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
    checkRadio();
    loadTaxiSpots();
}

function init() {
    initMap();
    // initHist();
    // initLinePlot();
}

init();