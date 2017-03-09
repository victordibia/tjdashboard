(function($) {
    var questions = [];
    var i = 0;
    var sessionid = "";
    var timevar;
    var currenttask = "judgement";
    var processing = false;


    var $range = $("#range_5");
    $range.ionRangeSlider({
        type: 'single',
        step: 1,
        min: 0,
        max: 100,
        grid: true,
    });

    $("#updatebutton").click(function() {
        launchNextTask();
        processing = false;
    })

    $("#lightbutton").click(function() {
        $('#cp8').colorpicker('show');
        $('#cp8').focus();
        //console.log($('#cp8').data('colorpicker').color)
    })


    $('#cp8').colorpicker({
        customClass: 'colorpicker-2x',

    });

    $('#cp8').colorpicker().on('changeColor', function(e) {
        $("#lightbutton").css("background-color", e.color.toString('hex'));
        $("#lightbutton").css("border-color", e.color.toString('hex'));
        console.log(e.color.toString('rgba'), e.color.toString('hex'))
    });




    $range.on("change", function() {
        $("#familiarity").text($(this).prop("value"));
    });
    $range.on("change", function() {
        $("#nextfamiliarbutton").prop('disabled', false);
    });



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
