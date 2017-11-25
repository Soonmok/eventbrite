$(function() {
    $('.need-confirm-btn').click(function() {
      if (confirm('Are you sure to delete?')) {
        return true;
      }
      return false;
    });
    function getSelectedValue() {
      var $hiddenForm = $(document.getElementById("hidden"));
      var $selectedValue = $(document.getElementById("selectFormPrice"));
      console.log($selectedValue.val());
      if ($selectedValue.val() == 'PAID') {
          $hiddenForm.show();
      }
      else {
          $hiddenForm.hide();
      }
    }
  });
  