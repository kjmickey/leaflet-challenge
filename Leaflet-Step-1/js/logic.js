// //  Omaha, NE coordinates
// //  center of map - at least at the beginning - may change later
var omahaCoords = [41.29, -96.22];
var mapZoomLevel = 3;   // start zoom level, shows most of N/S America, at least on my screen
var maximumZoom = 10;   // zooming in closer than this is not useful


// ********** here is where you comment/uncomment the data set you want to look at **********

// significant quakes last week 
// var quakesjson = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson"

// 4.5+ during past week
// var quakesjson = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"

// 2.5+ during past week
// var quakesjson = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"

// 1+ during past week
// var quakesjson = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson"

// All quakes past week
var quakesjson = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Perform API call to USGS API to get earthquake data
d3.json(quakesjson, function(earthquakeData) {
  createFeatures(earthquakeData.features);
});

// Function to scale the Magnitude 
function markerSize(magnitude) {
  return magnitude * 20000;
};

// Function to assign color depends on the depth
function getColor(depth) {
 
 var colors = ['green','yellow','gold','orange','pink','red'];
 // var colors = ["#85c1c8", "#9c8184", "#af4980", "#c0182a", "#d33300", "#e99900", "#ffff00"];

  return  depth > 500? colors[5]:
          depth > 250? colors[4]:
          depth > 100? colors[3]:
          depth > 50? colors[2]:
          depth> 25? colors[1]:
                 colors[0];
};

function createFeatures(earthquakeData) {

  var earthquakes = L.geoJSON(earthquakeData,{
    // Give each feature a popup describing with information pertinent to it
    onEachFeature: function(feature, layer){
      layer.bindPopup("<b>When: </b>" + new Date(feature.properties.time) + "<hr><b>Where: </b>" + feature.properties.place +"<hr><b>How Big and Deep:<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Magnitude: </b>"+ feature.properties.mag + "<br><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Depth: </b>" + feature.geometry.coordinates[2] + " Miles" );
    },

    pointToLayer: function(feature, latlng){                    
      return new L.circle(latlng,                               
      { radius: markerSize(feature.properties.mag),             
        fillColor: getColor(feature.geometry.coordinates[2]), 
        fillOpacity: .8,                                        
        color: 'grey',                                          
        weight: .5                                              
      })
    }    
  });

  createMap(earthquakes);
};  
  
function createMap(earthquakes) {

  // Define lightmap, outdoorsmap, and satellitemap layers
  let mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

  let lightmap = L.tileLayer(mapboxUrl, {id: 'mapbox.light', maxZoom: maximumZoom,  id: "mapbox/light-v10", accessToken: API_KEY});
  // let darkmap = L.tileLayer(mapboxUrl, {id: 'mapbox.run-bike-hike',  maxZoom: maximumZoom, id: "mapbox/outdoors-v11", accessToken: API_KEY});
  // let satellitemap = L.tileLayer(mapboxUrl, {id: 'mapbox.streets-satellite', maxZoom: maximumZoom, id: "mapbox/satellite-v9", accessToken: API_KEY});



  
  var tectonicPlates = new L.LayerGroup();
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function (plateData) {
    L.geoJSON(plateData,
      {
        color: 'orange', 
        weight: 2
      })
      .addTo(tectonicPlates);
  });    

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Grayscale": lightmap,
    // "Dark Map": darkmap,
    // "Satellite Map" : satellitemap
  };
  

    // Create our map, giving it the lightmap and earthquakes layers to display on load
  var myMap = L.map("mapid", {
    center: omahaCoords,
    zoom: mapZoomLevel,
    layers: [lightmap, earthquakes]
  });

   
  // Create a legend to display information in the bottom left
  var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function(map) {

    var div = L.DomUtil.create('div','info legend'),
        depths = [0,25,50,100,250,500],
        labels = [];

    div.innerHTML += "<h4 style='margin:4px'>Depth (Miles)</h4>" 
    // loop through our density intervals and generate a label for each interval
    for (var i=0; i < depths.length; i++){
      div.innerHTML +=
        '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
        depths[i] + (depths[i+1]?'&ndash;' + depths[i+1] +'<br>': '+');
      }
      return div;
  };
  legend.addTo(myMap);
}