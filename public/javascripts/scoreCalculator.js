function scoreCalculate(numParticipation, numReview, title) {
    var score = numParticipation * 10 + numReview * 5;
    console.log(score);
    $(document.getElementById(title)).hide();
    if (score > 30) {
        $(document.getElementById(title)).show();
        console.log(title);
    }
}