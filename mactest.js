var server = require("./server");
var filePath = process.cwd() + "/public/img";
var request = require("request");
var config = require('./config');
//console.log(filePath)

setInterval(function() {
    //logSpeak();
    //logVision();
}, 8000)

var listening
server.wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        message = JSON.parse(message)
        console.log("beee", (message));
        switch (message.event) {
            case 'wave':
                //wave()
                break;
            case 'speak':
                console.log("speaking ", message.value)
                //  tj.speak(message.value)
                logSpeak(message.value);
                break;
            case 'dance':
                //predance()
                break;

            case 'see':
                //see()
                logVision();
                break;

            case 'led':
                //tj.shine(message.color)
                //
            case 'listening':

                listening = message.value;

                if (listening) console.log("bog listening")
                break;

        }
    });

});

function logSpeak(message) {
    sender = Math.random() > 0.5 ? "TJBot" : "You"
    message = "hello .. " + message
    var message = {
        type: "speech",
        sender: sender,
        title: sender == "you" ? "What TJBot thinks you said:" : "WHat TJBot says",
        transcript: message,
        description: "",
        intent: Math.random() > 0.5 ? null : "Wave",
        timestamp: Date.now(),
        tags: [{
            title: "speech to text",
            url: "#"
        }, {
            title: "text to speech",
            url: "#"
        }, {
            title: "microphone",
            url: "#"
        }, {
            title: "speaker",
            url: "#"
        }],
        confidence: 1
    }
    console.log(message)
    server.sendEvent(message)
}

function logVision() {
    sender = "Vision"
    message = "The objects I see in the image are "
    var message = {
        type: "vision",
        title: "What TJBot Sees",
        sender: sender,
        transcript: message,
        description: "",
        imageurl: "img/screen.jpg",
        timestamp: Date.now(),
        tags: [{
            title: "visual recognition",
            url: "#"
        }, {
            title: "camera",
            url: "#"
        }],
        visiontags: [{
            title: "visual recognition",
            url: "#"
        }, {
            title: "camera",
            url: "#"
        }],
        confidence: 1
    }
    console.log(message)
    server.sendEvent(message)
}

//45.42, -75.69
//getWeather(-115.1728, 36.1699);
//getCordinates("Las vegas", "city", "US", "NV");

function getCordinates(query, locationtype, countrycode, admindistrictcode) {
    query = query.replace(/ /g, "+")
    var url = "https://" + config.credentials.weather.username + ":" + config.credentials.weather.password + "@" + config.credentials.weather.host + ":" + config.credentials.weather.port + "/api/weather/v3/location/search?query=" + query + "&locationType=" + locationtype + "&countryCode=" + countrycode + "&adminDistrictCode=" + admindistrictcode + "&language=en-US";
    var options = {
        method: 'GET',
        url: url
    }
    request(options, function(error, response, body) {

        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body)
            //console.log(result)
            var longitude = result.location.longitude[0];
            var latitude = result.location.latitude[0];
            //console.log(longitude, latitude);
            getWeather(longitude, latitude)
        } else {
            console.log("Error getting cordinates")
        }
    });

}

function getWeather(long, lat) {
    var url = "https://" + config.credentials.weather.username + ":" + config.credentials.weather.password + "@" + config.credentials.weather.host + ":" + config.credentials.weather.port + "/api/weather/v1/geocode/" + lat + "/" + long + "/observations.json?units=m&language=en-US";
    var options = {
        method: 'GET',
        url: url
    }
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body)
            var ob = result.observation
            var location = ob.obs_name;
            var temp = ob.temp;
            var desc = ob.wx_phrase;
            var feelslike = ob.feels_like;
            var windspeed = ob.wspd + " km/h";
            var uv = ob.uv_desc;
            var alldesc = "The weather in " + location + " today is " + desc + " with a temperature of " + temp + " that feels more like " +
                feelslike + ". Wind speed is " + windspeed + " and UV is " + uv;
            console.log(alldesc);
        } else {
            console.log("weather error")
        }
    });
}
