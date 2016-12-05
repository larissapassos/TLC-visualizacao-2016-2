var LAT_MIN = "regions.lat_min",
    LAT_MAX = "regions.lat_max",
    LNG_MIN = "regions.lng_min",
    LNG_MAX = "regions.lng_max";

var OPACITY = 0.5;

var loaded = false;
var loadedData;
var selectedRect;
var selectedData;

function isInsideRect(coords, rect) {
    var minLng = rect[0][0] <= rect[1][0] ? rect[0][0] : rect[1][0],
            minLat = rect[0][1] <= rect[1][1] ? rect[0][1] : rect[1][1],
            maxLng = rect[0][0] <= rect[1][0] ? rect[1][0] : rect[0][0],
            maxLat = rect[0][1] <= rect[1][1] ? rect[1][1] : rect[0][1];
        
        return coords[0][0] >= minLng && coords[2][0] <= maxLng && coords[0][1] >= minLat && coords[2][1] <= maxLat;
}

function filterPoints(points, rect) {
    if (points) {
        selectedRect = points.filter(function(d) {
            return isInsideRect(d.geometry.coordinates[0], rect);
        });
    }

    selectedData = loadedData.filter(function(d) {
        var coords = [ [d[LNG_MIN], d[LAT_MIN]], [], [d[LNG_MAX], d[LAT_MAX]] ];
        return isInsideRect(coords, rect);
    });
}