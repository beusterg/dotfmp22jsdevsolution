const utils = require("utils");
const path = require("path");
const packageJson = require("../package.json");
 

// Get record id from parameter (originally from package.json as variable)
const recordId = process.argv.slice(2)[0];
console.log('Upload started -> FileMaker record ID: ', recordId);

const pathToInlinedFile = path.join(__dirname, "../", "inlined", "index.html");

const confirm = utils.askConfirmUpload(recordId, pathToInlinedFile, packageJson.name);
