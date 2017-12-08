function getSelectedValue() {
    var $hiddenForm = $(document.getElementById("hidden"));
    var $selectedValue = $(document.getElementById("selectFormPrice"));
    console.log($selectedValue.val());
    if ($selectedValue.val() == 'FREE') {
        $hiddenForm.hide();
    }
    else {
        $hiddenForm.show();
    }
}
