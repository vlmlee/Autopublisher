var fs = require('fs');
var mongoose = require('mongoose');
var config = JSON.parse(fs.readFileSync('config.json'));

if (config.username === '' && config.password === '') {
    var uri = 'mongodb://localhost:27017/' + config.database;
} else {
    var uri = 'mongodb://' + config.username + ':' + config.password + '@' + 'localhost:27017/' + config.database;
}

mongoose.connect(uri);
mongoose.connection.once('connected', function() {
    console.log('Connected to database.');
});

var Schema = mongoose.Schema;
var postSchema = new Schema({
    postTitle: String,
    postBlob: String,
    postBody: String
}, { timestamps: true });

var Posts = mongoose.model('Posts', postSchema);

fs.readdir(workingDir, function(err, files) {
    for (var index in files) {
        // emit('publish', files[index]);
    }
});

function publish(file) {
    fs.readFile(file, 'utf8', function(err, content) {
        if (err) throw err;

        var postTitle = new RegExp('\<.*?\>', 'g').exec(content)[0].removeCharContainers();
        var postBlob = postTitle.split(' ').join('-');
        var postBody = new RegExp('\{.*?\}', 'g').exec(content)[0].removeCharContainers();

        Posts.findOneAndUpdate({ blob: postBlob }, {
                $set: {
                    title: postTitle,
                    blob: postBlob,
                    body: postBody
                }
            }, { upsert: true },
            function(err, post) {
                if (err) throw err;
            }
        );
    });
}

String.prototype.removeCharContainers = function() {
    return this.slice(1, -1).trim();
}
