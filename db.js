const { MongoClient } = require('mongodb');

const {
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_NAME,
  MOVIES_COLLECTION,
  SERIES_COLLECTION,
} = process.env;

const DB_URL = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}?retryWrites=true&w=majority`;

const openCollection = async (collection, cb) => {
  try {
    const client = new MongoClient(DB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    await client.connect();
    const database = client.db(DB_NAME);
    const col = database.collection(collection);
    await cb(col);
    client.close();
  } catch (err) {
    console.log(err);
  }
};

module.exports = { openCollection, MOVIES_COLLECTION, SERIES_COLLECTION };
