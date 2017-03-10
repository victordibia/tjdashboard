var server = require("./server");
var filePath = process.cwd() + "/public/img"
console.log(filePath)

setInterval(function() {
    //logSpeak();
    //logVision();
}, 8000)


server.wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        message = JSON.parse(message)
        console.log("beee", (message));
        switch (message.event) {
            case 'wave':
                //wave()
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

        }
    });

});

function logSpeak() {
    sender = Math.random() > 0.5 ? "TJBot" : "You"
    message = "hello"
    var message = {
        type: "speech",
        sender: sender,
        title: sender == "you" ? "What TJBot thinks you said" : "WHat TJBot says",
        transcript: message,
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
