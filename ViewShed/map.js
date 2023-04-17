var map;

require([
        "esri/map",
        
        "esri/Color",
        "esri/graphic",
        "esri/graphicsUtils",
        "esri/tasks/Geoprocessor",
        
        "esri/tasks/FeatureSet",
        "esri/tasks/LinearUnit",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "dojo/dom",
        "dojo/domReady!"
],function (Map, Geoprocessor,  Color, Graphic, graphicUtils,  FeatureSet, LinearUnit, SimpleMarkerSimbol, SimpleLineSymbol, SimpleFillSymbol, dom) {
            // Parse DOM nodes decorated with the data-dojo-type attribute
    // var map, gp;


            // Create the map
            map = new Map("divMap", {
                basemap: "topo",
                center: [-122.45, 37.75],
                zoom: 12
            });

            var gp = new Geoprocessor("http://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed");
            gp.setOutputSpatialReference({
                wkid: 102100
            });
            map.on("click", computeViewShed);

        function computeViewShed(evt){
            map.graphics.clear();
            var pointSymbol = new SimpleMarkerSimbol();
            pointSymbol.setSize(14);
            pointSymbol.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 38, 115, 1])));
            pointSymbol.setColor(new Color([0, 168, 132, 0.25]));

            var graphic = new Graphic(evt.mapPoint, pointSymbol);
            map.graphics.add(graphic);

            var features = [];
            features.push(graphic);
            var featureSet = new FeatureSet();
            featureSet.features = features;
            var vsDistance = new LinearUnit();
            vsDistance.distance = 5;
            vsDistance.units = "esriMiles";
            var params = {
                "inpud_Observation_Point": featureSet,
                "Viewshed_Distance": vsDistance
            };
            gp.execute(params, drawViewshed);

        }

        function drawViewshed(results, messages){
            console.log(results)
            var polySymbol = SimpleFillSymbol();
            polySymbol.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([115, 0, 76, 1])));
            polySymbol.setColor(new Color([230, 0, 0, 0.53]));
            var features = results[0].value.features;
            for (var f = 0, fl = features.length; f < fl; f++){
                var feature = features[f];
                feature.setSymbol(polySymbol);
                map.graphics.add(feature);
            }
            map.setExtent(graphicUtils.graphicsExtent(map.graphics.graphics), true);
        }


           
    });