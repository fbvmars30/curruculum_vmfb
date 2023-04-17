var map;

// @formatter:off
require([
        "esri/map",
        "esri/toolbars/draw",
        "esri/graphic",
        "esri/graphicsUtils",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Color",


        "esri/tasks/Geoprocessor",
        "esri/tasks/FeatureSet",
        "esri/tasks/LinearUnit",

        "dojo/ready",
        "dojo/parser",
        "dojo/on",
        "dojo/_base/array"],
    function (Map, Draw, Graphic, graphicsUtils, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color,
              Geoprocessor, FeatureSet, LinearUnit,
              ready, parser, on, array) {
// @formatter:on

        // Wait until DOM is ready *and* all outstanding require() calls have been resolved
        ready(function () {

            // Parse DOM nodes decorated with the data-dojo-type attribute
            // parser.parse();


            // Create the map
            map = new Map("divMap", {
                basemap: "topo",
                center: [-122.45, 37.75],
                zoom: 12
            });

            /*
             * Step: Construct the Geoprocessor
             */
            var gp = new Geoprocessor("http://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed");

            map.on("load", function () {

                /*
                 * Step: Set the spatial reference for output geometries
                 */
                gp.outSpatialReference = map.spatialReference;


                // Collect the input observation point
                var point = new Draw(map);
                point.on("draw-end", calculateViewshed);
                point.activate(Draw.POINT);

                function calculateViewshed(evt) {

                    // clear the graphics layer
                    map.graphics.clear();

                    // marker symbol for drawing viewpoint
                    var viewpoint = new SimpleMarkerSymbol();
                    viewpoint.setSize(12);
                    viewpoint.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 38, 115, 1]), 1));
                    viewpoint.setColor(new Color([0, 168, 132, 0.25]));

                    // add viewpoint to the map
                    var graphicViewpoint = new Graphic(evt.geometry, viewpoint);
                    map.graphics.add(graphicViewpoint);

                    /*
                     * Step: Prepare the first input parameter
                     */
                    var fsInputPoint = new FeatureSet();
                    fsInputPoint.features.push(graphicViewpoint);
                    console.log('fsInputPoint', fsInputPoint)

                    /*
                     * Step: Prepare the second input parameter
                     */
                    var luDistance = new LinearUnit();
                    luDistance.distance = 3;
                    luDistance.units = "esriMiles";

                    /*
                     * Step: Build the input parameters into a JSON-formatted object
                     */
                    var gpParams = {
                        "Input_Observation_Point": fsInputPoint,
                        "Viewshed_Distance": luDistance
                    };

                    /*
                     * Step: Wire and execute the Geoprocessor
                     */
                    gp.on("execute-complete", displayViewshed);
                    gp.execute(gpParams);

                }

                function displayViewshed(results, messages) {

                    // polygon symbol for drawing results
                    var sfsResultPolygon = new SimpleFillSymbol();
                    sfsResultPolygon.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([115, 0, 76, 1]), 1));
                    sfsResultPolygon.setColor(new Color([230, 0, 0, 0.53]));

                    /*
                     * Step: Extract the array of features from the results
                     */
                    var pvResult = results.results[0];
                    var gpFeatureRecordSetLayer = pvResult.value;
                    var arrayFeatures = gpFeatureRecordSetLayer.features;

                    // loop through results
                    array.forEach(arrayFeatures, function (feature) {

                        /*
                         * Step: Symbolize and add each graphic to the map's graphics layer
                         */
                        feature.setSymbol(sfsResultPolygon);
                        map.graphics.add(feature);

                    });

                    // update the map extent
                    var extentViewshed = graphicsUtils.graphicsExtent(map.graphics.graphics);
                    map.setExtent(extentViewshed, true);
                }

            });
        });
    });