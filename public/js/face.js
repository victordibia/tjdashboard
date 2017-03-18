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
    $("button").prop("disabled", true)

    function connectSocket() {
        ws = new WebSocket(socketurl);
        ws.onopen = function() {
            $(".disableoverlay").hide();
            $("button").prop("disabled", false)
            $(".firstitem").hide();
            console.log("Connection opened");
        };

        ws.onmessage = function(evt) {
            //console.log("event data:", evt.data);
            var data = JSON.parse(evt.data);

            var bgcolor = data.confidence >= 0.5 ? "bg-green" : "bg-red";
            var title = "";
            var timestamp = new Date(data.timestamp);
            timestamp = timestamp.getHours() + ":" + timestamp.getMinutes() + " " + months[timestamp.getMonth()] + " " +
                +timestamp.getDate() + " " + timestamp.getFullYear();
            var sender = data.sender;
            var image = "";
            var transcript = "";
            var visiontags = "";
            var html = "";
            var tags = "";
            var intent = "";
            data.tags.forEach(function(tag) {
                tags = tags + "<a class='tagframe bg-green btn' href= '" + tag.url + "'> " + tag.title + "</a>";
            })

            if (data.intent) {
                intent = "<div class='bg-yellow intent'> Matched Intent : " + data.intent + "</div>"
            }

            if (data.type == "vision") {
                image = "<img class='img-responsive selectimage' src='" + data.imageurl + "' >"
                liclass = "fa fa-camera fa-3x " + bgcolor;
                transcript = "";
                data.visiontags.forEach(function(tag) {
                    visiontags = visiontags + "<a class='tagframe bg-green btn' href= '" + tag.url + "'> " + tag.title + "</a>";
                });
                html = "<div class='col-md-12'> " +
                    "<span class='bg-green updatetype'> <i class='fa  fa-camera'></i>  " + "Picture Taken!" + " </span> " +
                    image +
                    "<div class=''>" + tags + "</div>" +
                    "<hr />" +
                    "</div>";

            } else if (data.type == "speech") {
                transcript = "<div class='direct-chat-text chattext'> " + data.transcript + "</div>";
                var imgcol = "<div class='col-md-2 pad0'>   <img class='chatimg' src='/img/tj.jpg' alt='message user image'> <span class='sendertitle bg-green'> " + data.sender + " </span> </div>";
                var valcol = "<div class='col-md-10'> " +
                    "<div class='row'>" +
                    "<span class='bg-green updatetype'> <i class='fa  fa-wechat'></i>  " + data.type + " </span> " +
                    "<span class='bg-green updatetype'> " + data.title + "</span> " +
                    "<span class='direct-chat-timestamp pull-right'> " + timestamp + "</span> " +
                    transcript +
                    intent +
                    "<div class='tagbox' >" + tags + "</div>";
                if (data.sender.toLowerCase() != "you") {
                    html = "<div class='margin10 row  '>" +
                        imgcol +
                        valcol +
                        "</div>" +
                        "</div>  " +
                        "</div>  " + "<hr />";
                } else {
                    html = "<div class='margin10 row  '>" +
                        "<div class='col-md-10 right'> " +
                        "<div class='row'>" +
                        "<span class='bg-green updatetype'> <i class='fa  fa-wechat'></i>  " + data.type + " </span> " +
                        "<span class='bg-green updatetype'> " + data.title + "</span> " +
                        "<span class='direct-chat-timestamp pull-right'> " + timestamp + " &nbsp</span> " +
                        transcript +
                        intent +
                        "<div class='tagbox' >" + tags + "</div>" +
                        "</div>" + "</div>" +
                        "<div class='col-md-2 pad0'>   <img class='chatimg' src='/img/you.jpg' alt='message user image'>  <span class='sendertitle bg-green'> " + data.sender + " </span>  </div>" +
                        "</div>  " + "<hr />";
                }
            }

            console.log(html)




            // var html = "<li>" +
            //     "<i class = '" + liclass + "'></i> " +
            //     "<div class='timeline-item'>" +
            //     "<span class='time'><i class='fa fa-clock-o  '></i> &nbsp" + timestamp + "</span>" +
            //     "<h3 class='timelinetitle'><a href='#'>" + data.type + "</a> " + data.title + "</h3>" +
            //     "<div class='timeline-body'>" + image +
            //     "<span class='transcript'>" + transcript + "</span>" +
            //     "</div>" +
            //     "<div class=''>" + tags + "</div>" +
            //     "</div>" +
            //     "</div> </li>";

            $(html).insertAfter(".firstitem").hide().show("slow");

        };

        ws.onclose = function() {
            console.log("Connection is closed...");
            $(".disableoverlay").show();
            $(".firstitem").show();
            $("button").prop("disabled", true)

            setTimeout(function() {
                connectSocket();
            }, 3000)
        };
    }




    $("#listening").switchButton({
        width: 110,
        height: 40,
        button_width: 70,
        labels_placement: "right"
    })

    $("#listening").change(function() {

    })




    $("#lightbutton").click(function() {
        $('#lightbutton').colorpicker('show');
        //$('#cp8').focus();
        //console.log($('#cp8').data('colorpicker').color)
    })


    $('#lightbutton').colorpicker({
        customClass: 'colorpicker-2x',
        color: "green",
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

    $("#seetextbutton").click(function() {
        var message = {}
        message.event = "seetext"
        ws.send(JSON.stringify(message));
    })

    var listeningstatus = false;
    $("#listeningbutton").click(function() {

        if (listeningstatus) {
            $("#listeningicon").attr("class", "fa  fa-toggle-off fa-2x");
            listeningstatus = false;
            $("#listeningtext").text("OFF")
        } else {
            $("#listeningicon").attr("class", "fa  fa-toggle-on fa-2x")
            listeningstatus = true;
            $("#listeningtext").text("ON")
        }

        var message = {}
        message.event = "listening"
        message.value = listeningstatus;

        ws.send(JSON.stringify(message));
        console.log(listeningstatus)
    })

    $("#speaksendbutton").click(function() {
        sendSpeakMessage();
    })

    $("#speakinputmessage").keypress(function(e) {
        if (e.which == 13) {
            //sendSpeakMessage();
            $("#speaksendbutton").click();
        }
    })


    function sendSpeakMessage() {
        var message = {}
        message.event = "speak"
        message.value = $("#speakinputmessage").val()
        if (message.value != "") {
            ws.send(JSON.stringify(message));
        }
        $("#speakinputmessage").val("");
    }



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
