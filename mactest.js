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
        testFaces()
        break;

      case 'led':
        //tj.shine(message.color)
        //
      case 'tone':
        fetchTones();
        break;
      case 'listening':

        listening = message.value;

        if (listening) console.log("bog listening")
        break;

    }
  });

});



var Watson = require('watson-developer-cloud');
var toneAnalyzer = Watson.tone_analyzer({
  username: config.credentials.tone_analyzer['username'],
  password: config.credentials.tone_analyzer['password'],
  version: 'v3',
  version_date: '2016-05-19'
});



const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs');

const visual_recognition = new VisualRecognitionV3({
  api_key: config.credentials.visual_recognition['api_key'],
  version_date: config.credentials.visual_recognition['version']
});

const params = {
  // must be a .zip file containing images
  images_file: fs.createReadStream('public/img/faceg.jpg')
};


// test face fetching on mac
testFaces()
//
function testFaces() {
  locations = {
    "images": [{
      "faces": [{
          "age": {
            "max": 54,
            "min": 45,
            "score": 0.342022
          },
          "face_location": {
            "height": 195,
            "left": 752,
            "top": 88,
            "width": 105
          },
          "gender": {
            "gender": "FEMALE",
            "score": 0
          }
        },
        {
          "age": {
            "max": 24,
            "min": 18,
            "score": 0.502411
          },
          "face_location": {
            "height": 150,
            "left": 336,
            "top": 83,
            "width": 126
          },
          "gender": {
            "gender": "MALE",
            "score": 0.989013
          }
        },
        {
          "age": {
            "max": 24,
            "min": 18,
            "score": 0.58114
          },
          "face_location": {
            "height": 179,
            "left": 40,
            "top": 57,
            "width": 142
          },
          "gender": {
            "gender": "FEMALE",
            "score": 0.993307
          }
        }
      ],
      "image": "faceg.jpg"
    }],
    "images_processed": 1
  }

  var response = {
    facelocations: locations,
    imageurl: "img/faceg.jpg"
  }

  logVision(response)



}

function fetchFaces() {
  visual_recognition.detectFaces(params, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(JSON.stringify(res, null, 2));
      var response = {
        facelocations: res,
        imageurl: "img/faceg.jpg"
      }

      setInterval(function() {
        //logVision(response)
      }, 8000)
      logVision(response)

    }
  });
}
//fetchTones();

function fetchTones() {
  var params = {
    text: "I am happy happy happy bear"
  };
  toneAnalyzer.tone(params, function(err, tone) {
    if (err) {
      console.error("The tone_analyzer service returned an error. This may indicate you have exceeded your usage quota for the service.");
      console.error("Raw error:");
      console.error(JSON.stringify(err));
    } else {
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

    }
  });

}


function logTone(max, tones) {
  var message = {
    type: "tone",
    sender: "TJBot",
    title: "Main emotion in text below is " + max.tone_id + " (" + max.score.toFixed(2) * 100 + "%)",
    transcript: "message",
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

function logSpeak(message) {
  sender = Math.random() > 0.5 ? "TJBot" : "You"
  message = "hello .. " + message
  var message = {
    type: "speech",
    sender: sender,
    title: sender == "you" ? "What TJBot thinks you said:" : "WHat TJBot says",
    transcript: message,
    description: "",
    faceurl: faceurl,
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

function logVision(response) {
  sender = "Vision"
  message = "The objects I see in the image are "
  var message = {
    type: "vision",
    facelocations: response.facelocations,
    title: "What TJBot Sees",
    sender: sender,
    transcript: message,
    description: "",
    imageurl: response.imageurl,
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

var cv = require('opencv');
//getFaces();
var faceurl = null;

function getFaces() {
  var starttime = Date.now();
  var endtime;
  var COLOR = [0, 255, 0]; // default red
  var thickness = 1; // default 1

  var imgsource = "public/img/faceg.jpg";
  var imgdestination = "public/img/faced.jpg"

  cv.readImage(imgsource, function(err, im) {
    if (err) throw err;
    if (im.width() < 1 || im.height() < 1) throw new Error('Image has no size');

    im.detectObject("haar/face.xml", {}, function(err, faces) {
      if (err) throw err;

      for (var i = 0; i < faces.length; i++) {
        var face = faces[i];
        im.rectangle([face.x, face.y], [face.width, face.height], COLOR, 2);

      }
      if (faces.length > 0) {
        var face = faces[0];
        img = im.roi(face.x, face.y, face.width - 2, face.height - 2);
        img.save("public/img/facecut.jpg")
        faceurl = "/img/facecut.jpg";
      }
      endtime = Date.now()
      console.log("faces found: ", faces.length, "timetaken: ", (endtime - starttime) / 1000)

      im.save(imgdestination);
      var response = {};
      response.imageurl = "/img/faced.jpg";
      response.faceurl = "/img/facecut.jpg";
      response.transcript = faces.length + " faces detected.";
      logVision(response)
      console.log('Image saved to ', imgdestination);
    });
  });
}
