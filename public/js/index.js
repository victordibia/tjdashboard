(function($) {
    var now = new Date();
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var month = months[now.getMonth()];

    $(".time-label .bg-blue").text(now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear())

    var socketurl = "ws://" + window.location.href.replace(/.*?:\/\//g, "");
    var ws = new WebSocket(socketurl);

    ws.onopen = function() {
        ws.send("Message  from browser ");
        console.log("Message is sent...");
    };

    ws.onmessage = function(evt) {
        var data = JSON.parse(evt.data);
        console.log("Message is received..." + data.transcript);
        var bgcolor = data.confidence >= 0.5 ? "bg-green" : "bg-red";
        var liclass = "fa fa-bullhorn " + bgcolor;
        var timestamp = new Date(data.timestamp);
        timestamp = timestamp.getHours() + ":" + timestamp.getMinutes();
        var sender = data.sender;
        var transcript = data.transcript;

        var html = "<li>" +
            "<i class = '" + liclass + "'></i> " +
            "<div class='timeline-item'>" +
            "<span class='time'><i class='fa fa-clock-o'></i> &nbsp" + timestamp + "</span>" +
            "<h3 class='timeline-header'><a href='#'>" + sender + "</a> " + transcript + "</h3>" +
            "<div class='timeline-body'>" + description + "</div>" +
            "</div> </li>";

        $(html).insertAfter(".time-label").hide().show("slow");

    };

    ws.onclose = function() {
        console.log("Connection is closed...");
    };


    // <li>
    //   <i class="fa fa-user bg-aqua"></i>
    //   <div class="timeline-item">
    //     <span class="time"><i class="fa fa-clock-o"></i> 5 mins ago</span>
    //     <h3 class="timeline-header no-border"><a href="#">Sarah Young</a> accepted your friend request</h3>
    //   </div>
    // </li>


})(jQuery);
