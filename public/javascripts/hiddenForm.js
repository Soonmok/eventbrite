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

function showHiddens() {
    var $hiddenForm = $(document.getElementById("hidden"));
    $hiddenForm.show();
}