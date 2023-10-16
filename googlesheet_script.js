// Usage
//  1. Save your GAS Project
//
//  2. Click: Run > setup
//
//  3. Click: Publish > Deploy as web app 
//    - enter Project Version Description (optional) 
//    - set security level and enable service ( execute as 'me' and access 'anyone, even anonymously) 
//
//  4. Copy the 'Current web app URL' and paste it into the Leaderboard JavaScript file (first line)
//

/*
** Do Not Edit Below This Line **
*/

// Create a new property service to maintain variables accross instances.
var SCRIPT_PROP = PropertiesService.getScriptProperties(); 

// What to do when a when we recieve an HTTP GET request
function doGet(e) {
    // For this simple app we only need to do one thing.
    return addUser(e.parameter['id'], e.parameter['score'], e.parameter['time'])
}

// Add our user record and return the list of top ten. 
function addUser(id, score,timeused) {
    //Open the spreadsheet we set up by it's ID
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
    //Get the first sheet
    var sheet = doc.getSheets()[0];
    // we want a public lock, one that locks for all invocations
    var lock = LockService.getPublicLock();
    lock.waitLock(30000); // wait 30 seconds before conceding defeat.
    //wrap everything in a try/catch to handle errors
    try {
        var timeNow = new Date() //create a timestamp
        var nextRow = sheet.getLastRow() + 1; // get next empty row
        //create an array of data to put into the row
        var row = [
            [id, score, timeused, timeNow]
        ];
        //put the data into the row
        sheet.getRange(nextRow, 1, 1, 4).setValues(row);
        //sort the sheet with our custom function
        sortByScore(sheet)
        // get the top ten with our custom function
        var top10 = getTop10(sheet)
        // get this user's rank from our custom function
        var userRank = findUserRank(id, score,timeused, timeNow, sheet);
        //retun a JSON with the top ten and our user
        return ContentService.createTextOutput(JSON.stringify({
            "result": "success",
            "users": top10,
            "user": userRank
        })).setMimeType(ContentService.MimeType.JSON);
    } catch (e) {//something went wrong. Return an error
        return ContentService.createTextOutput(JSON.stringify({
            "result": "error",
            "error": e
        })).setMimeType(ContentService.MimeType.JSON);
    } finally { //release lock
        lock.releaseLock();
    }
}

//sort the sheet by column three (timeused)
function sortByScore(sheet) {
    // Find the last row with data.
    var lastRow = sheet.getLastRow();
  
    // Get the range of data.
    var range = sheet.getRange(2, 1, lastRow, 4);
  
     // Sort by score, then by timeused.
    range.sort({
      column: 3,
      ascending: true,
    }).sort({
      column: 2,
      ascending: false,
    });
  }

// gets the top ten users
function getTop10(sheet) {
    //get the first ten rows 
    var range = sheet.getRange(2, 1, 10, 4)
    var users = range.getValues()
    var top10 = []; //we'll store those ten users in this array
    //loop thru all ten and create a user object for each
    for (row = 0, len = users.length; row < len; row++) {
        if (users[row][0] != '') {//if the row is not empty
            var user = {}; //our user object
            //add data for each user
            user.id = users[row][0]
            user.score = +users[row][1]
            user.timeused = +users[row][2]
            user.date = +users[row][3]
            //push this user into the array of users
            top10.push(user)
        }
    }
    //return the top ten
    return top10
}

function findUserRank(id, score, timeused, timeNow, sheet) {
    //find the last row with data
    var lastRow = sheet.getLastRow()
    //get the data from the range
    var range = sheet.getRange(2, 1, lastRow, 4)
    var users = range.getValues()
    var user = {}; //create a user object
    //loop thru all rows to find our user
    for (row = 0, len = users.length; row < len; row++) {
        //if this row is our user
        if (users[row][0] == id && users[row][1] == score && users[row][2] == timeused && users[row][3] == timeNow.toString()) {
            //add data to the user object
            user.id = users[row][0]
            user.score = +users[row][1]
            user.timeused = +users[row][2]
            user.date = +users[row][3]
            //add the users rank (what row were they?)
            user.rank = row + 1
            break //exit our loop
        }
    }
    //return this user's data
    return user
}

//Setup our spreadsheet
function setup() {
    //get the spreadsheet
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    //save the spreadsheet's id for later 
    SCRIPT_PROP.setProperty("key", doc.getId());
    //get the first sheet
    var sheet = doc.getSheets()[0];
    //create an array of labels
    var row = [
        ["ID", "score", "timeused", "Timestamp"]
    ];
    //set the first row of the sheet to our labels
    sheet.getRange(1, 1, 1, 4).setValues(row);
}