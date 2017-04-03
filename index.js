var fs = require('fs');

function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function (err, filenames) {
        if (err) { onError(err); return; }
        filenames.forEach(function (filenames) {
            console.log(filenames);
        });
    });
}

var data = {};

readFiles('<dir_name_here>', function (filename, content) {
    data[filename] = content;
}, function (err) {
    throw err;
});