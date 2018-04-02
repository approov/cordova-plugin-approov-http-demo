/**********************************************************************************************
 * Project:     Demo Client App
 * File:        index.js
 * Original:    Created on 15 March 2017 by johnl
 *
 * Copyright(c) 2018 by CriticalBlue Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 **********************************************************************************************/

// Shapes server url
var SHAPES_URL = "https://demo-server.approovr.io/shapes"

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        if ("deviceready" == id) {
            // Configure Approov. For details, please see the plugin documentation.
            var config = {
                "customerName": "demo",
                "networkTimeout": 30.0,
                "tokenPayloadValue": "",
                "protectedDomains": [
                    {
                        "protectedDomainURL": SHAPES_URL,
                        "isMITMProtectedDomain": "true"
                    },
                ]
            };
            console.log("CORDOVA APPROOV HTTP SHAPES DEMO: app.receivedEvent(deviceready): Configuring Approov HTTP Plugin " + JSON.stringify(config, null, "    "));
            cordova.plugin.approov.http.approovConfigure(
                config,
                function(response) {
                    // Success
                    console.log("CORDOVA APPROOV HTTP SHAPES DEMO: Configured Approov HTTP Plugin");
                },
                function(response) {
                    // Failure
                    console.log("CORDOVA APPROOV HTTP SHAPES DEMO: Error configuring Approov HTTP Plugin: " + response.error);
                });

            // Activate request function
            document.getElementById("button").onclick = requestShape;
        }
    }
};

// Request shape
function requestShape() {
    console.log("CORDOVA APPROOV HTTP SHAPES DEMO: Request Button Pressed. Attempting to get a shape from the endpoint");
    setDisplay("text", "Fetching shape...");
    // get: function (url, params, headers, success, failure) {
    cordova.plugin.http.get(SHAPES_URL, {}, {}, 
        function(response) {
            // If success, response data contains shape name
            if (response.status == 200) {
                console.log("CORDOVA APPROOV HTTP SHAPES DEMO: Received a response from the demo server. Displaying the shape.");
                try {
                    responseShape = response.data;
                    console.log("CORDOVA APPROOV HTTP SHAPES DEMO: " + responseShape);
                    setDisplay("image", responseShape);
                } catch(e) {
                    console.error('CORDOVA APPROOV HTTP SHAPES DEMO: Malformed response, error: ' + e.message);
                    setDisplay("text", 'JSON parsing error: ' + e.message);
                }
            }
            // Shape or error displayed, set up reset action
            setDisplay("button", "RESET");
            document.getElementById("button").onclick = reset;
        },
        function(response) {
            if (response.status != 200) {
                // If failure, response error contains cause
                console.log("CORDOVA APPROOV HTTP SHAPES DEMO: Error on GET request: " + response.status);
                setDisplay("text", "Server error: " + response.error);
            }
        });
}

// Set html object (text, image or button) to different values
function setDisplay(id, string) {
    var display = document.getElementById(id);

    // Target element is text
    if (id == "text") {
        // If text is set to a value, clear image
        if (string != "") {
            setDisplay("image", "");
        }
        // set text
        display.innerHTML = string;
    // Target element is image
    } else if (id == "image") {
        // If image is set to empty, clear image
        if (string == "") {
            display.src = ""
        } else {    // Set image
            var newImage = new Image;

            // Replace display image when ready
            newImage.onload = function () {
                display.src = this.src;
                setDisplay("text", "");
            }
            newImage.src = "img/" + string + ".png";
        }
    // Target element is button
    } else if (id == "button") {
        // Set button value
        display.value = string;
    }
}

// Error function for alerting user
function error(errorString) {
    if (errorString == "") {
        alert("ERROR: Failed to fetch a token.");
    }
}

// Reset display text, image and button
function reset() {
    setDisplay("text", "Random shape generator");
    setDisplay("image", "");
    setDisplay("button", "REQUEST");
    document.getElementById("button").onclick = requestShape;
}

