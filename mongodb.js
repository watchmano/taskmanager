const { MongoClient, ObjectID } = require('mongodb')
const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log("Unable to connect")
    }

    const db = client.db(databaseName)
    

//or 쓰는 방법 봐두자.
    db.collection('tasks').deleteMany({
        completed: true
    }).then((result) => {
        console.log(result)
    }).catch((error) => {
        console.log(error)
    })

    db.collection('tasks').findOne({completed: false}, (error, task) => {
        console.log(task)
    })
    

})