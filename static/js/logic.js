const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to create the map
function createMap(eq){

    // Create the satellite tile
    let sat = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
        minZoom:2,
        maxZoom: 12,
        attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    });

    // Create topo Tile
    let openTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        minZoom:2,
        maxZoom: 12,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create StadiaToner tile
    var Stadia_StamenToner = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png', {
	minZoom: 2,
	maxZoom: 12,
	attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> <a href="https://stamen.com/" target="_blank">&copy; Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors'	
});

    // baseMaps object
    let baseMaps = {
        "Satellite" : sat,
        "OpenTopo": openTopo,
        "Stadia Toner": Stadia_StamenToner
    };

    // Create an overlay object
    let overlayMaps = {
        "Earthquakes" : eq
    };

    // Create the map
    let myMap = L.map("map",{
        center: [0, 0],
        zoom:2,
        layers:[sat,eq]
    });

    // Create a layer control
    var layerControl = L.control.layers(baseMaps, overlayMaps,{
        collapsed:false
    }).addTo(myMap);

    // Create the Tectonic Plate geoJSON
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then((geodata) => {

    let plates = L.geoJson(geodata,{
        style: {
            color: "orange",            
            fill: false
        }
    });

    // Add the plates to the Overlay
    layerControl.addOverlay(plates, "Tectonic Plates");

    });

    // Create a legend control
    let legend = L.control({
        position:"bottomright"
    });

    // Add a div class to legend control
    legend.onAdd = function(){
        let div = L.DomUtil.create("div", "legend");
        return div;
    };

    // Add legend control to map
    legend.addTo(myMap);

}

//createMap();

// Function to create the earthquake markers
function eqMarkers(response){

    // Function to determine marker color
    function circleColor(depth){
        if (depth < 10){
            return "#a3f601"
        } else if (depth < 30){
            return "#dcf400"
        } else if (depth < 50){
            return "#f7db12"
        } else if (depth < 70){
            return "#fdb72a"
        } else if (depth < 90){
            return "#fca35d"
        } else {return "#ff5f64"}
    };

    // Function to determine marker size
    function circleSize(mag){
        return mag*5;
    }

    // Function to bindpopup
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h4>Earthquake Details</h4><hr/>\
        <small><b>Date/Time:</b> ${new Date(feature.properties.time).toUTCString()}<br/>\
        <b>Location:</b> ${feature.properties.place}<br/>\
        <b>Lat:</b> ${feature.geometry.coordinates[1]}<br/>\
        <b>Long:</b> ${feature.geometry.coordinates[0]}<br/>\
        <b>Depth:</b> ${feature.geometry.coordinates[2]}<br/>\
        <b>Magnitude:</b> ${feature.properties.mag}<br/>\
        <a target="_blank" href=${feature.properties.url}>USGS Eventpage</a></small>`
        )};

    // Function to create Circle
    function createMarker(geoJsonPoint, latlng){
        //console.log(geoJsonPoint);
        return L.circleMarker(latlng, {
            radius : circleSize(geoJsonPoint.properties.mag),
            weight: 1,
            color: "gray",
            fillColor: circleColor(geoJsonPoint.geometry.coordinates[2]),
            fillOpacity: 0.9
        });
    };

    // Create the earthquake markers
    let eq_markers = L.geoJson(response,{
        pointToLayer : createMarker,
        onEachFeature : onEachFeature
        });
    
    // Call functions to create the map and legend
    createMap(eq_markers);
    createLegend();
}

// Function to create legend
function createLegend(){
    document.querySelector(".legend").innerHTML = [
        "<h4>Depth Legend</h4><hr/>",
        "<div class='legoption'><div class='box' style='background-color:#a3f601;'></div> -10-10</div>",
        "<div class='legoption'><div class='box' style='background-color:#dcf400;'></div> 10-30</div>",
        "<div class='legoption'><div class='box' style='background-color:#f7db12;'></div> 30-50</div>",
        "<div class='legoption'><div class='box' style='background-color:#fdb72a;'></div> 50-70</div>",
        "<div class='legoption'><div class='box' style='background-color:#fca35d;'></div> 70-90</div>",
        "<div class='legoption'><div class='box' style='background-color:#ff5f64;'></div> 90+</div>",
    ].join("");
}

d3.json(url).then(eqMarkers);