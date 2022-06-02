const path = require("path");
const fs = require('fs');
var dialog = require('dialog-node');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const baseUrl = "https://master.familienservice.de/fmi/data/vLatest/databases/dateiablage/";
const sessionUrl = baseUrl + "sessions";
const credentials = "Basic dXBsb2FkOnVwbG9hZA==";

const uploadUrl = baseUrl + "layouts/upload/records/";


var codeAsJson;
var filePath;
var recordId;
var token;


//Request
function makeUploadRequest(pathToFile, id) {

    filePath = pathToFile;
    recordId = id;

    convertCodeToJson().then(ok => requestToken()).then(ok => uploadCode()).catch(err => {
        console.log('Something went wrong', err);
    })

}

//Dialog

function askConfirmUpload(id, pathToFile, widgetName) {
    //will be called after user closes the dialog
    var callback = function (code, retVal, stderr) {
        if (code == 0 && retVal == id) makeUploadRequest(pathToFile, id);
    }

    dialog.entry('Bist Du Dir sicher, dass Du eine neue Version des folgenden Widgets in die Master hochladen willst: \n\n' + widgetName + ' (Record ID: ' + id + ' bitte überprüfen!) \n\nGib zur Bestätigung die Record ID für dieses Widget ein und drück OK!', 'Upload', 0, callback);
}


//upload code
var uploadCode = () =>
    // Return it as a Promise
    new Promise(function (resolve, reject) {

            var xhr = new XMLHttpRequest();
            var url = uploadUrl + recordId;
            console.log(url);
            console.log(token);
            xhr.open("PATCH", url);
            xhr.responseType = 'json';
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", "Bearer " + token);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    console.log("---uploading code---");
                    console.log("status");
                    console.log(xhr.status);
                    console.log("response:");
                    var responseText = xhr.responseText;
                    console.log(responseText);
                    console.log("---done---");
                    resolve("yeah");
                }
            };

            try {
                xhr.send(codeAsJson);
            } catch (e) {
                console.log(e);
                reject("meh");
            }
        }

    );



var convertCodeToJson = () =>
    // Return it as a Promise
    new Promise(function (resolve, reject) {

        try {

            console.log("---converting file---");
            //read file
            const data = fs.readFileSync(filePath, 'utf8');

            // create a buffer
            const buff = Buffer.from(data);

            // decode buffer as Base64
            const base64 = buff.toString('base64');

            //json
            codeAsJson = JSON.stringify({
                fieldData: {
                    'codeAsBase64': base64
                }
            });

            resolve(codeAsJson);

        } catch (e) {
            console.error(e);
            reject(e);

        }

    })


var requestToken = () =>

    // Return it as a Promise
    new Promise(function (resolve, reject) {


        // Create the XHR request
        var request = new XMLHttpRequest();

        // Setup our listener to process compeleted requests
        request.onreadystatechange = function () {

            // Only run if the request is complete
            if (request.readyState !== 4)
                return;

            // Process the response
            if (request.status >= 200 && request.status < 300) {
                // If successful
                console.log("response:");
                var responseText = request.responseText;
                console.log(responseText);
                token = JSON.parse(responseText).response.token;
                resolve(token);
            } else {
                // If failed
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            }

        };

        // Setup our HTTP request
        request.open("POST", sessionUrl);
        request.responseType = 'json';
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Authorization", credentials);

        // Send the request
        request.send();

    });



module.exports.askConfirmUpload = askConfirmUpload;