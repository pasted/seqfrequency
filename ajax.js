$(document).ready(function(){
    $.ajaxSetup({
      beforeSend:function(){      
        $("#loading").show();
      },
      complete:function(){
        $("#loading").hide();
      }
    });

    $('form#sequencer').submit(function(e) {
        e.preventDefault();
        var textInput = $('#sequence').attr('value');

        $.ajax({
            type: 'POST',
            url: '/cgi-bin/sequenceSummary.pl',
            async: false,
            data: "sequence=" + textInput,
            success: function(data) {
              if (data.error) {
                $('#error-div').html(data.error);
                $('#summary-results-div').html('');
              }
              else {
                $('#summary-results-div').html(data.success);
                $('#error-div').html('');
              }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
              $('#error-div').html(XMLHttpRequest.responseText 
              + ", textStatus: " + textStatus 
              + ", errorThrown: " + errorThrown);
              $('#error-div').addClass("error");
        }
        });
        return false;
    });
});
