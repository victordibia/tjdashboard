//var watson = require('watson-developer-cloud'); 
var AudioContext = require('web-audio-api').AudioContext
context = new AudioContext
var _ = require('underscore');
var request = require("request");

/************************************************************************
* Step #1: Configuring your Bluemix Credentials
************************************************************************
In this step, the audio sample (pipe) is sent to "Watson Speech to Text" to transcribe.
The service converts the audio to text and saves the returned text in "textStream"
*/


var fs = require('fs');
var exec = require('child_process').exec;

searchSpotify("smoothcriminal")

function searchSpotify(searchterm) {
    console.log("searching spotify for " + searchterm + " ....");
    var searchtype = "track"
    var options = {
        method: 'GET',
        url: "https://api.spotify.com/v1/search",
        qs: {
            q: searchterm.replace(/ /g, "+"),
            type: searchtype,
            market: "US",
            limit: 20
        }
    }
    var trackartists = ""
    var maxpopularity = 0;
    var selectedtrack;

    request(options, function(error, response, body) {
        var responsetext = ""
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body)
            if (result.tracks.items.length > 0) {
                //downloadFile(result.tracks.items[0].preview_url) ; // download preview file
                selectedtrack = result.tracks.items[0];
                result.tracks.items.forEach(function(track) {

                    selectedtrack = track.popularity > maxpopularity ? track : selectedtrack;
                    maxpopularity = track.popularity > maxpopularity ? track.popularity : maxpopularity;

                })
                //get selected track artists
                if (selectedtrack !== undefined) {
                    selectedtrack.artists.forEach(function(artist) {
                        trackartists = trackartists + artist.name + ", "
                    })
                    responsetext = "Found song " + selectedtrack.name + " by " + trackartists;
                    console.log("Found : " + selectedtrack.name, " by ", trackartists, selectedtrack.popularity)
                    downloadFile(selectedtrack.preview_url);
                }

            } else {
                console.log("no song found from spotify")
                //tj.shine("red")
                setTimeout(function() {
                    setLEDColor("white", 255);
                }, 800);
            }

        } else {
            console.log(error + " error" + response.statusCode)
        }
    })
}


function downloadFile(url) {
    var destinationfile = "preview.mp3"
    var file = fs.createWriteStream(destinationfile);
    var donwloadrequest = request.get(url);

    // verify response code
    donwloadrequest.on('response', function(response) {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }
    });
    // check for request errors
    donwloadrequest.on('error', function(err) {
        fs.unlink(destinationfile);
    });
    donwloadrequest.pipe(file);
    file.on('finish', function() {
        file.close();
        //dance(destinationfile);
    });

    file.on('error', function(err) { // Handle errors
        fs.unlink(destinationfile); // Delete the file async. (But we don't check the result)
    });
}

/**
 * [converttoWav converts file from Mp3 to wave. Needs to have mpg321 installed]
 * @return {[type]} [description]
 */

var isplaying = false;

function playsound(soundfile) {
    isplaying = true;
    //pauseMic();
    var destination = "preview.wav"
    console.log("Playing soundfile " + soundfile)
    const ls = spawn('mpg321', [soundfile, '-g', '50']);

    ls.on('close', (code) => {
        console.log('Done with music playback!');
        isplaying = false;
        //resumeMic()
        //setLEDColor("white", 255);
    });
}
