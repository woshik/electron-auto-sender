const MongoClient = require('mongodb').MongoClient

module.exports = () => {
	return new Promise ((resolve, reject) => {
	    MongoClient.connect('mongodb+srv://mailautosender:fUhZXM7IZKcTOlq5@cluster0-ebspw.mongodb.net/admin?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
		    .then(client => {
		        resolve(client.db('autosender'));
		    })
		    .catch(err => {
		        reject(err);
		    });
	})
}

