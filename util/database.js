const MongoClient = require('mongodb').MongoClient

module.exports = new Promise ((resolve, reject) => {
    MongoClient.connect('mongodb://localhost:27017/bdapps', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        resolve(client.db());
    })
    .catch(err => {
        reject(err);
    });
})

