var dashboard = require("./dashboard");
var tjbot = require('tjbot');
var config = require('./config');
var AudioContext = require('web-audio-api').AudioContext
context = new AudioContext
var request = require("request");
var fs = require('fs');

// obtain our credentials from config.js
var credentials = config.credentials;

// obtain user-specific config
var VOICE = config.voice;
var WORKSPACEID = config.conversationWorkspaceId;

// these are the hardware capabilities that TJ needs for this recipe
var hardware = ['microphone', 'speaker', 'led', 'servo'];

// Set up configuration paramters
var tjConfig = {
    verboseLogging: true, //enable console debugging
    servoPin: 7 // set servo pin
};

// instantiate our TJBot!
var tj = new tjbot(hardware, tjConfig, credentials);
tj.shine("white")
tj.seeAsync("text");

tj.listen(function(msg) {
    console.log(msg);
    logSpeak("you", msg);

    // tj.speakAsync("Ok .. got that").then(function() {
    //
    // })
});


function logSpeak(sender, message) {
    var message = {
        type: "speak",
        sender: sender,
        transcript: message,
        description: "",
        imageurl: "",
        timestamp: Date.now(),
        confidence: 1
    }
    console.log(message)
    dashboard.sendEvent(message)
}
