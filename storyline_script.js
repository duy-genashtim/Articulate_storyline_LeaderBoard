//what is the url of your google Sheet?
var sheetURL = "https://script.google.com/macros/s/AKfycbzY7xp1Y-gHppq8xgsOTv8h72ngFScIjHQYEvA1_6DzvzA6e5lldgyAAvu6aur2Nqhb/exec";
var scoreVarName = "userScore"; //what is the name of the score varible in SL?
var userVarName = 'userName'; //what is the name of the user name varible in SL?
var topTenVarName = 'topTen'; //what is the name of the top ten message varible in SL?

/*
 *** Do not edit below this line. ***
 */
var player = GetPlayer(); //Get the SL player
var userScore = player.GetVar(scoreVarName); //Get the score from the player
var userTag = player.GetVar(userVarName); //Get the user name from the player
player.SetVar(topTenVarName, "Loading..."); //Temporarily set the top ten message 
var topTenMsg; //We will build the top ten message in this var. 
//Set up our AJAX 
var xhttp;
if (window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest();
} else {
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
}
// get time
var timeU = player.GetVar('timeUsed');
var timeInSeconds =  timeU / 1000;
var timeInMin = timeInSeconds/60;
var timeUsed = timeInMin.toFixed(2);

xhttp.open("GET", sheetURL + "?id=" + userTag + "&score=" + userScore+ "&time=" + timeUsed, true);
xhttp.send();
xhttp.onreadystatechange = function () {
    //If we get a successful reply from our spreadsheet:
    if (xhttp.readyState == 4 && xhttp.status == 200) {
        var topTenJson = JSON.parse(xhttp.responseText);
        //This is the begining of the top ten message. Edit carefully
        //First we create the results for this learner (\n creates a new line)
        var userResults = "You placed " + topTenJson.user.rank + " with a score of " + topTenJson.user.score + "\n";
        //Then we introduce the top ten.
        var topTenUsers = "The top " + topTenJson.users.length + " gamers are: \n";
        //We append the second line of text to the message
        topTenMsg = userResults + topTenUsers;
        //Now we loop through each of the top 10
        for (var i = 0; i < topTenJson.users.length; i++) {
            //convert the date to something friendly 
            var recordDate = new Date(topTenJson.users[i].date);
            var recordDateString = recordDate.getDate() + "/" + (recordDate.getMonth() + 1) + "/" + recordDate.getFullYear() + " " + recordDate.getHours() + ":" + recordDate.getMinutes();
            //Append the users info (rank, name, date) to the message. 
            topTenMsg += (i + 1) + " - User: " + topTenJson.users[i].id + " | Score: " + topTenJson.users[i].score + " | Time Used: " + topTenJson.users[i].timeused + " | When: " + recordDateString + "\n";
        }
        //Push the message back into Storyline
        player.SetVar(topTenVarName, topTenMsg);
    }
}
