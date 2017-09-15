var server = require("./server");
var tjbot = require('tjbot');
var config = require('./config');
var AudioContext = require('web-audio-api').AudioContext
context = new AudioContext
var request = require("request");
var _ = require("underscore");
var fs = require('fs');
var fileDir = process.cwd() + "/public/img/snaps"
var curImage = "";
var faceurl = null;
var yourwords = "";


// obtain our credentials from config.js
var credentials = config.credentials;

// obtain user-specific config
//var VOICE = constants.config.voice;

var WORKSPACEID = config.conversationWorkspaceId;


// these are the hardware capabilities that TJ needs for this recipe
var hardware = ['microphone', 'speaker', 'led', 'servo', "camera"];

// set up configuration paramters from config file
var tjConfig = config.tjConfig;

var listening = true;
var detectface = false;
var detecttone = false;
var currentusername = "you";

// instantiate our TJBot!
var tj = new tjbot(hardware, tjConfig, credentials);

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
        tj.shine(message.color);
        break;
      case 'speak':
        console.log("speaking ", message.value);
        logSpeak(currentusername, message.value);
        addToWords(message.value)
        converse(message.value);
        break;
      case 'listening':
        console.log("toggle listening", message.value);
        listening = message.value;
        break;
      case 'detectface':
        console.log("toggle detectface", message.value)
        detectface = message.value;
        break;
      case 'tone':
        console.log("toggle tone", message.value)
        detecttone = message.value;
        if (!detecttone) yourwords = "";
        break;
    }
  });

});

startListening();

function startListening() {
  tj.listen(function(msg) {
    if (listening) {
      logSpeak(currentusername, msg);
      addToWords(msg);
      checkName(msg); // check if the person is trying to report their name
      // send to the conversation service
      converse(msg);
    }
  });
}

function addToWords(msg) {
  yourwords = yourwords + " " + msg;
  if (detecttone) analyzeTone();
}

function analyzeTone() {
  tj.analyzeTone(yourwords).then(function(tone) {
    var tones;
    tone.document_tone.tone_categories.forEach(function(category) {
      if (category.category_id == "emotion_tone") {
        // find the emotion with the highest confidence
        var max = category.tones.reduce(function(a, b) {
          return (a.score > b.score) ? a : b;
        });
        tones = category.tones;
        console.log(category.tones);
        logTone(max, tones)
      }
    });
  });
}

function checkName(msg) {
  if (msg.indexOf("my name is") > -1) {
    currentusername = msg.replace("my name is ", "")
    var speakmessage = "nice to meet you " + currentusername;
    tj.speak(speakmessage);
    logSpeak("tjbot", speakmessage)
  }
}

function logTone(max, tones) {
  var message = {
    type: "tone",
    sender: "TJBot",
    title: "Main emotion detected: " + max.tone_id + " (" + max.score.toFixed(2) * 100 + "%)",
    transcript: yourwords,
    maxtone: max,
    description: "",
    tones: tones,
    timestamp: Date.now(),
    tags: [{
      title: "tone analyzer",
      url: "#"
    }, {
      title: "speech to text",
      url: "#"
    }]
  }
  console.log(message)
  server.sendEvent(message)
}


function converse(msg) {

  tj.converse(WORKSPACEID, msg, function(response) {
    // speak the result
    response = response.object;
    if (response.output != undefined && response.output.text.length > 0) {
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
            getCordinates(config.weather.city, "city", config.weather.country, config.weather.state);
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
    //console.log("conversation response", responsfde)
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
  tj.speak(prompt).then(function() {})

  curImage = Date.now() + ".jpg";
  filePath = fileDir + "/" + curImage;

  tj.takePhoto(filePath).then(function(filePath) {

    var response = {};
    response.imageurl = curImage;
    response.transcript = "Scanning for text."
    logVision("tjbot", response)

    tj.recognizeTextInPhoto(filePath).then(function(objects) {
      console.log(" ... response .. ", JSON.stringify(objects))
      var description = objects.images[0].text;
      response.description = (description == "" || description == null) ? "No text recognized in the image." : "The words I see are : " + description;
      logSpeak("TJBot", response.description);
      tj.speak(response.description).then(function() {
        tj.shine("white");
      })
    });
  });
}

function see(conversation_response) {
  //logSpeak("TJBot", conversation_response);
  tj.speak(conversation_response);
  curImage = Date.now() + ".jpg";
  filePath = fileDir + "/" + curImage;

  tj.takePhoto(filePath).then(function(filePath) {
    console.log(" ==== face ===", detectface);
    var response = {};
    response.imageurl = curImage;
    response.transcript = "";

    if (detectface) {
      detectFaces(filePath, curImage);
    } else {
      logVision("tjbot", response);
    }

    tj.recognizeObjectsInPhoto(filePath).then(function(objects) {
      objects = _.sortBy(objects, function(o) {
        return o.score;
      })
      console.log(" ... response .. ", objects)
      var description = "";
      var numMaxTags = 6;
      console.log()
      for (var i = objects.length - 1; i > (objects.length - numMaxTags); i--) {
        if (objects[i].score >= 0.5 && i < numMaxTags) {
          description = description + ", " + objects[i].class
        }
      }
      response.description = (description == "" || description == null) ? "No objects recognized in the image." : "The objects I see are : " + description;
      logSpeak("TJBot", response.description);
      tj.speak(response.description).then(function() {
        tj.shine("white");
      })
    });

  })
}


function detectFaces(filePath, curImage) {
  const params = {
    images_file: fs.createReadStream(filePath)
  };

  tj._visualRecognition.detectFaces(params, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(JSON.stringify(res, null, 2));

      var response = {
        facelocations: res,
        imageurl: curImage,
        faceurl: faceurl,
        transcript: res.images[0].faces.length + " faces detected."
      }
      logVision("tjbot", response);
    }
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

  tj.play(soundFile);

}

function logVision(sender, response) {
  var message = {
    type: "vision",
    title: "What TJBot Sees",
    sender: sender,
    transcript: response.transcript,

    facelocations: response.facelocations,

    description: "",
    imageurl: "/img/snaps/" + response.imageurl,
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
  //if (response.faceurl) message.faceurl = response.faceurl,
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
    faceurl: faceurl,
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
  var url = "https://" + credentials.weather.username + ":" + credentials.weather.password + "@" + credentials.weather.host + ":" + credentials.weather.port + "/api/weather/v3/location/search?query=" + query + "&locationType=" + locationtype + "&countryCode=" + countrycode + "&adminDistrictCode=" + admindistrictcode + "&language=en-US";
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
  var url = "https://" + credentials.weather.username + ":" + credentials.weather.password + "@" + credentials.weather.host + ":" + credentials.weather.port + "/api/weather/v1/geocode/" + lat + "/" + long + "/observations.json?units=m&language=en-US";
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

      var feelslike = (ob.feels_like == ob.temp) ? "" : " that feels more like " + ob.feels_like;
      var windspeed = ob.wspd + " km/h";
      var uv = ob.uv_desc;
      var alldesc = "The weather in " + location + " today is " + desc + " with a temperature of " + temp +

        feelslike + ". Wind speed is " + windspeed + " and UV is " + uv;
      console.log(alldesc);
      logSpeak("TJBot", alldesc);
      tj.speak(alldesc);
    } else {
      console.log("weather error")
    }
  });
}
