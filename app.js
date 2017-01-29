var restify = require('restify');
var builder = require('botbuilder');
var http = require("http");
  // url = "http://developer.goibibo.com/api/search/?app_id=936d5ea1&app_key=4a7413a086c4f18a50cbcdad1c80de64&format=json&source=BOM&destination=DEL&dateofdeparture=20170129&seatingclass=E&adults=2&children=0&infants=0&counter=100";
     url = "http://developer.goibibo.com/api/search/?app_id=936d5ea1&app_key=4a7413a086c4f18a50cbcdad1c80de64&format=json";
    
var dict={
            mumbai : "BOM",
            kolkata : "CCU",
            delhi : "DEL",
            bangalore : "BLR",
            jaipur : "JAI",
            hyderabad : "HYD",
            chennai : "MAA",
            kochi : "COK"
        };

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});


var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================
/*
bot.dialog('/', [
    function (session) {
        builder.Prompts.text(session, "Hello... What's your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response + ", How many years have you been coding?"); 
    },
    function (session, results) {
        session.userData.coding = results.response;
        builder.Prompts.choice(session, "What language do you code Node using?", ["JavaScript", "CoffeeScript", "TypeScript"]);
    },
    function (session, results) {
        session.userData.language = results.response.entity;
        session.send("Got it... " + session.userData.name + 
                    " you've been programming for " + session.userData.coding + 
                    " years and use " + session.userData.language + ".");
    }
]);
*/

var useEmulator = (process.env.NODE_ENV == 'development');

var luisAppId = '1cf7161f-31e0-4425-a3ee-04f70df6b71f' ;
var luisAPIKey = 'f2401d01e7964fa9a1b2687c638d3701';
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
//bot.dialog('/', new builder.IntentDialog({ recognizers: [recognizer] })
.matches('BookFlight', (session, args) => {
	
    session.send('Processing your request for \'%s\'.', session.message.text);

    var fromCity=builder.EntityRecognizer.findEntity(args.entities, 'FromLocation');
    var ToCity=builder.EntityRecognizer.findEntity(args.entities, 'ToLocation');
    var tickets=builder.EntityRecognizer.findEntity(args.entities, 'Ticket');
    
    if(!fromCity){

      //  sesssion.dialogData.searchType='FromLocation';
        session.send('Enter source city');
    } 
    
    if(!ToCity){
            session.send("Enter destination city")  ;  }

    if(!tickets){
       session.send("Enter number of tickets and age group");
    }


   url=url+"&source="+dict.fromcity+"&destination"+dict.ToCity+"&dateofdeparture=20170129&seatingclass=E&adults=2"+/*ticket[0]*/+"&children=0&infants=0&counter=100";
 
// get is a simple wrapper for request()
// which sets the http method to GET


var request = http.get(url, function (response) {
    // data is streamed in chunks from the server
    // so we have to handle the "data" event    
    var buffer = "", 
        data,
        route;

    response.on("data", function (chunk) {
        buffer += chunk;
       //console.log(buffer);
    }); 

    response.on("end", function (err) {
        // finished transferring data
        // dump the raw data
       // console.log(buffer);
        //console.log("\n");
        data1 = JSON.parse(buffer);
        route=data1.data;
        var route_array=route.onwardflights;
      for(var i=0;i<route_array.length && i<6;i++)
            session.send("Result "+i+"\nflightcode: " + route_array[i].flightcode  + "\nseats available: " + route_array[i].seatsavailable
              + "\ngross amount : " + route_array[i].fare.grossamount  + "\ngross amount : " + route_array[i].fare.grossamount  
              + "\nairline : " + route_array[i].airline  + "\nflight duration: " + route_array[i].splitduration  + "\n\n");
         

    }); 
}); 
    

})



.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}