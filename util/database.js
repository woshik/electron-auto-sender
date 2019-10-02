const MongoClient = require('mongodb').MongoClient

module.exports = MongoClient.connect('mongodb://localhost:27017/bdapps', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('databse successfully connected');
        client.db();
    })
    .catch(err => {
        throw new Error('Database Connection Fail');
    });