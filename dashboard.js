var server = require("./server");
var tjbot = require('tjbot');
var constants = require('./config');
var AudioContext = require('web-audio-api').AudioContext
context = new AudioContext
var request = require("request");
var fs = require('fs');
var fileDir = process.cwd() + "/public/img"
var curImage = "";


// obtain our credentials from config.js
var credentials = constants.credentials;

// obtain user-specific config
var VOICE = constants.config.voice;
var WORKSPACEID = constants.config.conversationWorkspaceId;

// these are the hardware capabilities that TJ needs for this recipe
var hardware = ['microphone', 'speaker', 'led', 'servo'];

// Set up configuration paramters
var config = {
    verboseLogging: true, //enable console debugging
    servoPin: 7, // set servo pin
    cameraParams: {
        height: 720,
        width: 960,
        vflip: false,
        hflip: false
    } // setup my camera capture parameters
};

var listening = true;

// obtain our configs from config.js and merge with custom configs
config = Object.assign(constants.config, config);

// instantiate our TJBot!
var tj = new tjbot(hardware, config, credentials);

server.wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        message = JSON.parse(message)
        console.log("beee", (message));
        switch (message.event) {
            case 'wave':
                var prompt = "Waving my arm. Just for you. ";
                logSpeak("TJBot", prompt);
                wave(prompt)
                break;
            case 'dance':
                var prompt = "Sure. I'll play some music and dance.";
                logSpeak("TJBot", prompt);
                predance(prompt)
                break;
            case 'see':
                var prompt = "A moment. Let me look around.";
                logSpeak("TJBot", prompt);
                see(prompt)
                break;
            case 'seetext':
                var prompt = "Sure. Scanning for text in the image.";
                logSpeak("TJBot", prompt);
                seeText(prompt)
                break;
            case 'led':
                console.log("shinning led ", message.color)
                tj.shine(message.color)
                break;
            case 'speak':
                console.log("speaking ", message.value)
                logSpeak("you", message.value);
                converse(message.value);
                // tj.speak(message.value).then(function() {
                //     tj.shine("white");
                // });
                break;
            case 'listening':
                console.log("toggle listening", message.value)
                listening = message.value;
                break;

        }
    });

});

startListening();



function startListening() {

    tj.listen(function(msg) {
        if (listening) {
            logSpeak("you", msg);
            // send to the conversation service
            converse(msg);
        }
    });

}

function converse(msg) {
    tj.converse(WORKSPACEID, msg, function(response, responseText) {
        // speak the result
        response = response.object;
        if (response.output.text.length > 0) {
            //console.log(response)
            conversation_response = response.output.text[0];
            if (conversation_response != undefined) {
                var matchedIntent = response.intents[0].intent; // intent with the highest confidence
                var intentconfidence = response.intents[0].confidence;
                console.log("> intents : ", response.intents);

                if (intentconfidence > 0.5) {
                    tj.shine("green");
                    if (matchedIntent == "dance") {
                        predance("Sure, will play some music");
                        //dance();
                    } else if (matchedIntent == "wave") {
                        wave(conversation_response);
                    } else if (matchedIntent == "see") {
                        see(conversation_response);
                    } else if (matchedIntent == "off_topic") {
                        // do nothing
                    } else if (matchedIntent == "weather") {
                        getCordinates("Las vegas", "city", "US", "NV");
                    } else {
                        tj.speak(conversation_response).then(function() {
                            tj.shine("white");
                        });
                    }
                    if (matchedIntent != "off_topic") {
                        logSpeak("TJBot", conversation_response, matchedIntent + " (" + intentconfidence.toFixed(2) * 100 + "%)");
                    }

                } else {
                    tj.shine("red");
                    setTimeout(function() {
                        tj.shine("white");
                    }, 800);
                }

            } else {
                tj.shine("red");
                console.log("The response (output) text from your conversation is empty. Please check your conversation flow \n" + JSON.stringify(response))
            }
        } else {
            console.error("The conversation service did not return any response text.");
        }
        //console.log("conversation response", response)
    });
}

function setLED(color) {
    tj.shine(color)
}

function predance(conversation_response, intent) {
    //logSpeak("TJBot", conversation_response, intent);
    tj.speak(conversation_response).then(function() {
        dance("club.wav")
    });
}

function wave(conversation_response) {
    //logSpeak("TJBot", conversation_response);
    tj.speak(conversation_response).then(function() {
        // wave
        tj.wave();
        tj.wave();
        tj.shine("white");
    })
}

function seeText(prompt) {
    //logSpeak("TJBot", prompt);
    tj.speak(prompt).then(function() {
        curImage = Date.now() + ".jpg";
        filePath = fileDir + "/" + curImage;
        tj.captureImage(filePath).then(function(filePath) {
            logVision("tjbot", filePath)
            tj.callVisualRecognition("text", filePath).then(function(response) {
                console.log(" ... response .. ", response.description)
                if (response.description != null) {
                    logSpeak("TJBot", response.description);
                    tj.speak(response.description).then(function() {
                        tj.shine("white");
                    })
                }
            });
        })

    });
}

function see(conversation_response) {
    //logSpeak("TJBot", conversation_response);
    tj.speak(conversation_response).then(function() {
        curImage = Date.now() + ".jpg";
        filePath = fileDir + "/" + curImage;
        tj.captureImage(filePath).then(function(filePath) {
            logVision("tjbot", filePath)
            tj.callVisualRecognition("classify", filePath).then(function(response) {
                console.log(" ... response .. ", response.description)
                if (response.description != null) {
                    logSpeak("TJBot", response.description);
                    tj.speak(response.description).then(function() {
                        tj.shine("white");
                    })
                }
            });
        })

    });
}

/**
 * [dance play a soundFile and dance to its beats]
 * @param  {[type]} soundFile [soundfile to be decoded and danced to]
 * @return {[type]}           [description]
 */
function dance(soundFile) {
    // Decode the sound file to get its digital signal data
    var audioContext = new AudioContext
    fs.readFile(soundFile, function(err, buf) {
        if (err) throw err
        audioContext.decodeAudioData(buf, function(audioBuffer) {
            console.log("> finished decoding sound file ", soundFile);
            findPeaks(audioBuffer.getChannelData(0), audioBuffer.sampleRate, soundFile);
        }, function(err) {
            throw err
        })
    })

}

/**
 * [_findPeaks find peaks or high energy positions in audioBuffer data and move arm based on that to simulate dance.]
 * @param  {[type]} audioBuffer [decoded audio data]
 * @param  {[type]} sampleRate  [audio sample rate]
 * @return {[type]}             [description]
 */
function findPeaks(audioBuffer, sampleRate, soundFile) {
    var interval = 0.05 * 1000;
    var index = 0;
    var step = Math.round(sampleRate * (interval / 1000));
    var max = 0;
    var prevmax = 0;
    var prevdiffthreshold = 0.3;

    var sampleSound = setInterval(function() {
        if (index >= audioBuffer.length) {
            clearInterval(sampleSound);
            tj.shine("white");
            return;
        }
        for (var i = index; i < index + step; i++) {
            max = audioBuffer[i] > max ? audioBuffer[i].toFixed(1) : max;
        }
        // Spot a significant increase or peak? Wave Arm
        if (max - prevmax >= prevdiffthreshold) {
            // do some funky waving.
            var delay = 300;
            tj.raiseArm();
            setTimeout(function() {
                tj.lowerArm();
            }, delay);
        }
        prevmax = max;
        max = 0;
        index += step;
    }, interval);
    tj.playSound(soundFile);
}

function logVision(sender, imageurl) {
    console.log(imageurl)
    var message = {
        type: "vision",
        title: "What TJBot Sees",
        sender: sender,
        transcript: "picture taken",
        description: "",
        imageurl: "/img/" + imageurl,
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
    //console.log(message)
    server.sendEvent(message)
}

function logSpeak(sender, transcript, intent) {

    var message = {
        type: "speech",
        sender: sender,
        title: sender == "you" ? "What TJBot thinks you said" : "What TJBot says",
        transcript: transcript,
        intent: intent,
        description: "",
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
    //console.log(message)
    server.sendEvent(message)
}

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
            logSpeak("TJBot", alldesc);
            tj.speak(alldesc);
        } else {
            console.log("weather error")
        }
    });
}
