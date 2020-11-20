const { MongoClient, ObjectId, ObjectID } = require('mongodb');

const {
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_NAME,
  MOVIES_COLLECTION,
  SERIES_COLLECTION,
  DELETE_PASSWORD,
} = process.env;

const openCollection = async (collectionName) => {
  const DB_URL = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}?retryWrites=true&w=majority`;
  const client = new MongoClient(DB_URL, { useUnifiedTopology: true });
  await client.connect();
  const database = client.db(DB_NAME);
  const collection = database.collection(collectionName);
  return { client, collection };
};

const errors = {
  noFoundDocument: 'There is no document with that identifier in the database',
  emptyDatabase: 'The database is empty',
  noDocumentAdded: 'No document was added to the database',
  noDocumentModified: 'No document was modified',
  mustSpecifyValidParameter: 'You must specify an input for this function',
  noDocumentDeleted: 'No document was deleted from the database',
};

const isValidId = (id) => {
  const regEx = /^[0-9a-fA-F]{24}$/;
  return regEx.test(id);
};

const isValidRating = (rating) => {
  const stringRating = `${rating}`;
  const regExp = /^[0-9]{1,2}$/;
  return regExp.test(stringRating);
};

const isValidRangeOfRatings = (rangeString) => {
  const regExp = /^[0-9]{1,2}-[0-9]{1,2}$/;
  return regExp.test(rangeString);
};

const isValidYear = (year) => {
  const stringYear = `${year}`;
  const regExp = /^[0-9]{4}$/;
  return regExp.test(stringYear);
};

const sanitizeItem = (item, collectionName) => {
  if (collectionName === MOVIES_COLLECTION) {
    return {
      title: item.title,
      year: parseInt(item.year, 10),
      rating: parseFloat(item.rating, 10),
      genre: item.genre,
    };
  }
  if (collectionName === SERIES_COLLECTION) {
    return {
      name: item.name,
      startYear: parseInt(item.year, 10),
      endYear: parseInt(item.year, 10),
      rating: parseFloat(item.rating, 10),
    };
  }
};

const findById = async (id, collectionName) => {
  const { client, collection } = await openCollection(collectionName);
  const result = await collection.findOne({ _id: ObjectId(id) });
  await client.close();
  return result ?? errors.noFoundDocument;
};

const findAllItems = async (collectionName) => {
  const { client, collection } = await openCollection(collectionName);
  const cursor = await collection.find();
  const result = await cursor.toArray();
  cursor.close();
  await client.close();
  return result || errors.emptyDatabase;
};

const findByRating = async (itemStr, collectionName) => {
  const { client, collection } = await openCollection(collectionName);
  const item = parseInt(itemStr, 10);
  const cursor = await collection.find({ rating: { $eq: item } });
  const result = await cursor.toArray();
  cursor.close();
  await client.close();
  return result.length ? result : errors.noFoundDocument;
};

const splitRangeIntoObject = (item) => {
  const numberA = parseFloat(item.split('-')[0], 10);
  const numberB = parseFloat(item.split('-')[1], 10);
  const lowerRange = Math.min(numberA, numberB);
  const higherRange = Math.max(numberA, numberB);
  return {
    higherRange,
    lowerRange,
  };
};

const findByRange = async (item, collectionName) => {
  const { client, collection } = await openCollection(collectionName);
  const { lowerRange, higherRange } = splitRangeIntoObject(item);
  const cursor = await collection.find({ rating: { $gte: lowerRange, $lte: higherRange } });
  const result = await cursor.toArray();
  cursor.close();
  await client.close();
  return result.length ? result : errors.noFoundDocument;
};

const findByString = async (item, collectionName) => {
  const { client, collection } = await openCollection(collectionName);
  const cursor = await collection.find({ $text: { $search: item } });
  const result = await cursor.toArray();
  cursor.close();
  await client.close();
  return result.length ? result : errors.noFoundDocument;
};

const findByYear = async (itemStr, collectionName) => {
  const { client, collection } = await openCollection(collectionName);
  const item = parseInt(itemStr, 10);
  const cursor = await collection.find({ year: { $eq: item } });
  const result = await cursor.toArray();
  cursor.close();
  await client.close();
  return result.length ? result : errors.noFoundDocument;
};

const isEmptyObject = (obj) => Object.keys(obj).length === 0;

const isRequestingCount = (str) => /^count$/.test(str);

const countMovies = async (collectionName) => {
  const moviesArr = await findAllItems(collectionName);
  const num = moviesArr.length;
  return `There are ${num} movies in the database.`;
};

const deleteOneItem = async (filter, collectionName) => {
  const { client, collection } = await openCollection(collectionName);
  let count = 0;
  if (isValidId(filter)) {
    const result = await collection.deleteOne({ _id: ObjectID(filter) });
    count = result.deletedCount;
  } else {
    const result = await collection.deleteOne({ $text: { $search: filter } });
    count = result.deletedCount;
  }
  client.close();
  return count;
};

const deleteItemsGivenYear = async (filter, collectionName) => {
  const { client, collection } = await openCollection(collectionName);
  let count = 0;
  if (collectionName === MOVIES_COLLECTION) {
    const result = await collection.deleteMany({ year: filter });
    count = result.deletedCount;
  } if (collectionName === SERIES_COLLECTION) {
    const resultA = await collection.deleteMany({ startYear: filter });
    const resultB = await collection.deleteMany({ endYear: filter });
    count = resultA.deletedCount + resultB.deletedCount;
  }
  await client.close();
  return count;
};

const deleteItemsGivenRating = async (filter, collectionName) => {
  const { client, collection } = await openCollection(collectionName);
  const result = await collection.deleteMany({ rating: filter });
  await client.close();
  return result.deletedCount;
};

const deleteItemsGivenString = async (filter, collectionName) => {
  const { client, collection } = await openCollection(collectionName);
  const result = await collection.deleteMany({ $text: { $search: filter } });
  const count = result.deletedCount;
  await client.close();
  return count;
};

const deleteManyItems = async (filter, collectionName) => {
  if (isValidYear(filTitleter)) {
    return deleteItemsGivenYear(filter, collectionName);
  }
  if (isValidRating(filter)) {
    return deleteItemsGivenRating(filter, collectionName);
  }
  return deleteItemsGivenString(filter, collectionName);
};

const deleteAllItems = async (collectionName) => {
  const { client, collection } = await openCollection(collectionName);
  const result = await collection.deleteMany({});
  await client.close();
  return result;
};

const createInstance = (collectionName) => ({

  async find(item = {}) {
    if (isEmptyObject(item)) return findAllItems(collectionName);
    if (isValidId(item)) return findById(item, collectionName);
    if (isValidRating(item)) return findByRating(item, collectionName);
    if (isValidRangeOfRatings(item)) return findByRange(item, collectionName);
    if (isValidYear(item)) return findByYear(item, collectionName);
    if (isRequestingCount(item)) return countMovies(collectionName);
    return findByString(item, collectionName);
  },

  async insert(movieObj) {
    const parsedObj = sanitizeItem(movieObj, collectionName);
    const { client, collection } = await openCollection(collectionName);
    const { insertedCount, insertedId } = await collection.insertOne(parsedObj, collectionName);
    await client.close();
    return insertedCount ? `New document id: ${insertedId}` : errors.noDocumentAdded;
  },

  async update(filter, changes) {
    const object = await this.find(filter, collectionName);
    const changesObj = sanitizeItem(changes, collectionName);
    const { client, collection } = await openCollection(collectionName);
    const { modifiedCount } = await collection.updateOne(object, { $set: { ...changesObj } });
    await client.close();
    return modifiedCount ? `${modifiedCount} item modified successfully` : errors.noDocumentModified;
  },

  async delete(filter, flag = 'DELETE-ONE') {
    let numItemsDeleted;
    if (filter === 'DELETE-ALL' && flag === DELETE_PASSWORD) {
      numItemsDeleted = await deleteAllItems(collectionName);
    } if (flag === 'DELETE-MANY') {
      numItemsDeleted = await deleteManyItems(filter, collectionName);
    } if (filter && flag === 'DELETE-ONE') {
      numItemsDeleted = await deleteOneItem(filter, collectionName);
    } if (!filter) {
      return errors.mustSpecifyValidParameter;
    }
    if (numItemsDeleted) return `${numItemsDeleted} item(s) deleted successfully.`;
    if (!numItemsDeleted) return errors.noDocumentDeleted;
  },
});

const Movies = createInstance(MOVIES_COLLECTION);
const Series = createInstance(SERIES_COLLECTION);

module.exports = { Movies, Series };
