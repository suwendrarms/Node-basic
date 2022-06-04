// ./src/database/mongo.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');

let database = null;
const uri = "mongodb";
// const databaseName = "wellnessapp";

async function startDatabase() {
    const mongo = new MongoMemoryServer();

    const mongoDBURL = uri;

    const connection = await MongoClient.connect(mongoDBURL, { useNewUrlParser: true });
    database = connection.db();
}

async function getDatabase() {
    if (!database) await startDatabase();
    return database;
}

module.exports = {
    getDatabase,
    startDatabase,
};
