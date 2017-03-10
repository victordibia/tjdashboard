(function($) {

    var now = new Date();
    var colortolerance = 1000;
    var diff = 0;
    var oldstamp = Date.now();
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var month = months[now.getMonth()];

    $(".time-label .bg-green").text(now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear())

    var socketurl = "ws://" + window.location.href.replace(/.*?:\/\//g, "");
    var ws;

    connectSocket();

    function connectSocket() {
        ws = new WebSocket(socketurl);
        ws.onopen = function() {
            $(".disableoverlay").hide();
            $(".firstitem").hide();
            console.log("Connection opened");
        };

        ws.onmessage = function(evt) {
            console.log("event data:", evt.data);
            var data = JSON.parse(evt.data);

            var bgcolor = data.confidence >= 0.5 ? "bg-green" : "bg-red";
            var liclass = "fa fa-bullhorn fa-3x" + bgcolor;
            var timestamp = new Date(data.timestamp);
            timestamp = timestamp.getHours() + ":" + timestamp.getMinutes() + " " + months[timestamp.getMonth()] + " " +
                +timestamp.getDate() + " " + timestamp.getFullYear();
            var sender = data.sender;
            var image = "";
            var transcript = data.transcript;
            var visiontags = ""
            if (data.type == "vision") {
                image = "<img class='img-responsive padbottom10' src='" + data.imageurl + "' >"
                liclass = "fa fa-camera fa-3x " + bgcolor;
                transcript = "";
                data.visiontags.forEach(function(tag) {
                    visiontags = visiontags + "<a class='tagframe bg-green btn' href= '" + tag.url + "'> " + tag.title + "</a>";
                })
            }


            var tags = ""
            data.tags.forEach(function(tag) {
                tags = tags + "<a class='tagframe bg-green btn' href= '" + tag.url + "'> " + tag.title + "</a>";
            })

            var html = "<li>" +
                "<i class = '" + liclass + "'></i> " +
                "<div class='timeline-item'>" +
                "<span class='time'><i class='fa fa-clock-o  '></i> &nbsp" + timestamp + "</span>" +
                "<h3 class='timeline-header'><a href='#'>" + data.type + "</a> " + data.title + "</h3>" +
                "<div class='timeline-body'>" + image +
                "<span class='transcript'>" + transcript + "</span>" +
                "</div>" +
                "<div class=''>" + tags + "</div>" +
                "</div>" +
                "</div> </li>";

            $(html).insertAfter(".time-label").hide().show("slow");

        };

        ws.onclose = function() {
            console.log("Connection is closed...");
            $(".disableoverlay").show();
            $(".firstitem").show();

            setTimeout(function() {
                connectSocket();
            }, 3000)
        };


    }


    $("#lightbutton").click(function() {
        $('#cp8').colorpicker('show');
        $('#cp8').focus();
        //console.log($('#cp8').data('colorpicker').color)
    })


    $('#cp8').colorpicker({
        customClass: 'colorpicker-2x',
        sliders: {
            saturation: {
                maxLeft: 200,
                maxTop: 200
            },
            hue: {
                maxTop: 200
            },
            alpha: {
                maxTop: 200
            }
        }
    }).on('changeColor', function(e) {
        diff = (Date.now() - oldstamp);
        //console.log(diff, "diff..")
        if (diff > colortolerance) {
            $("#lightbutton").css("background-color", e.color.toString('hex'));
            $("#lightbutton").css("border-color", e.color.toString('hex'));

            console.log(e.color.toString('rgba'), e.color.toString('hex'))

            var message = {}
            message.event = "led"
            message.color = e.color.toString('hex');
            oldstamp = Date.now();
            ws.send(JSON.stringify(message));
        }
        //
    });

    $("#wavebutton").click(function() {
        var message = {}
        message.event = "wave"
        ws.send(JSON.stringify(message));
    })

    $("#seebutton").click(function() {
        var message = {}
        message.event = "see"
        ws.send(JSON.stringify(message));
    })

    $("#dancebutton").click(function() {
        var message = {}
        message.event = "dance"
        ws.send(JSON.stringify(message));
    })

    $(document).keypress(function(e) {

    });








    function showUpdateMessage(title, message, buttontitle) {
        processing = true;
        $("#updatetitle").text(title);
        $("#updatemessage").html(message);
        $("#updatebutton").text(buttontitle);

        $('#updatemodal').modal({
            show: true
        })
    }



})(jQuery);
