$(function() {
    $('.event-participation-btn').click(function(e) {
      var $el = $(e.currentTarget);
      if ($el.hasClass('loading')) return;
      $el.addClass('loading');
      $.ajax({
        url: '/api/events/' + $el.data('id') + '/participation',
        method: 'POST',
        dataType: 'json',
        success: function(data) {
            console.log("su!")
          $('.event .num-participations').text(data.numParticipation);
          $('.event-participation-btn').hide();
        },
        error: function(data, status) {
          console.log("hello?")
          if (data.status == 401) {
            alert('Login required!');
            location = '/signin';
          }
          console.log(data, status);
        },
        complete: function(data) {
          $el.removeClass('loading');
        }
      });
    });

 
    $('.review-like-btn').click(function(e) {
        var $el = $(e.currentTarget);
        if ($el.hasClass('disabled')) return;
        $.ajax({
          url: '/api/reviews/' + $el.data('id') + '/like',
          method: 'POST',
          dataType: 'json',
          success: function(data) {
            $el.parents('.review').find('.num-likes').text(data.numLikes);
            $el.addClass('disabled');
          },
          error: function(data, status) {
            if (data.status == 401) {
              alert('Login required!');
              location = '/signin';
            }
            console.log(data, status);
          }
        });
      });
  }); 