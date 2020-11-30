const { MongoClient, ObjectId, ObjectID } = require('mongodb');

const {
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_USERS_NAME,
  USERS_COLLECTION,
  DELETE_PASSWORD,
} = process.env;

const openCollection = async () => {
  const DB_URL = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}?retryWrites=true&w=majority`;
  const client = new MongoClient(DB_URL, { useUnifiedTopology: true });
  await client.connect();
  const database = client.db(DB_USERS_NAME);
  const collection = database.collection(USERS_COLLECTION);
  return { client, collection };
};

const errors = {
  noFoundDocument: 'There is no user with that identifier in the database',
  emptyDatabase: 'The database is empty',
  noDocumentAdded: 'No user was added to the database',
  noDocumentModified: 'No user was modified',
  mustSpecifyValidParameter: 'You must specify an input for this function',
  noDocumentDeleted: 'No user was deleted from the database',
};

// * Validations

const isValidId = (id) => {
  const regEx = /^[0-9a-fA-F]{24}$/;
  return regEx.test(id);
};

const isValidEmail = (str) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regEx.test(String(str).toLowerCase());
};

const isValidUsername = (str) => (!isValidEmail(str) && !isValidId(str) && str.length >= 3);

// * findBy...

const findById = async (id) => {
  const { client, collection } = await openCollection();
  const result = await collection.find({ _id: ObjectId(id) });
  await client.close();
  return result || errors.emptyDatabase;
};

const findByEmail = async (email) => {
  const { client, collection } = await openCollection();
  const result = await collection.find({ $search: { $text: email } });
  await client.close();
  return result || errors.emptyDatabase;
};

const findByUsername = async (name) => {
  const { client, collection } = await openCollection();
  const result = await collection.find({ $search: { $text: name } });
  await client.close();
  return result || errors.emptyDatabase;
};

const userExists = async (id) => (await findById(id) !== errors.noFoundDocument);

const getUser = async (str) => {
  if (!userExists(str)) return errors.noFoundDocument;
  let user;
  if (isValidId(str)) user = await findById(str);
  if (isValidEmail(str)) user = await findByEmail(str);
  if (isValidUsername(str)) user = await isValidUsername(str);
  return user;
};

const hasAccess = async (str) => {
  const user = await getUser(str);
  return user.access;
};

const isAdmin = async (str) => {
  const user = await getUser(str);
  return user.admin;
};

const isCorrectPassword = async (str, pass) => {
  const user = await getUser(str);
  return (user.pass === pass);
};

const deleteAllUsersWithoutAccess = () => {
  // TODO: !!!
};

const deleteUserWithName = (name) => {
  // TODO: !!!
  const { _id } = findByUsername(name);
  deleteUserById(_id);
};

const deleteAllItems = async (pass) => {
  if (pass !== DELETE_PASSWORD) return errors.noDocumentDeleted;
  const { client, collection } = await openCollection();
  const result = await collection.deleteMany({});
  await client.close();
  return result;
};

class UserDatabaseInstance {
  constructor(collection) {
    this.collection = collection;
  }

  async find(str) {
    if (isValidId(str)) return findById(str);
    if (isValidEmail(str)) return findByEmail(str);
    return findByUsername(str);
  }

  async insert(userObj) {
    // TODO: !!! Do a check to make sure that the email, username and access are OK.
    const { client, collection } = await openCollection();
    const { insertedCount, insertedId } = await collection.insertOne(userObj);
    await client.close();
    return insertedCount ? `New document id: ${insertedId}` : errors.noDocumentAdded;
  }

  async update(filter, changes) {
    const object = await this.find(filter);
    // TODO: !!! Do a check to make sure that the email, username and access are OK.
    const { client, collection } = await openCollection();
    const { modifiedCount } = await collection.updateOne(object, { $set: { ...changes } });
    await client.close();
    return modifiedCount ? `${modifiedCount} item modified successfully` : errors.noDocumentModified;
  }

  async delete(filter, pass) {
    if (!userExists(filter)) return errors.noDocumentDeleted;
    if (isValidId(filter && isCorrectPassword(filter, pass))) return deleteUserById(filter);
    return deleteUserWithName(filter);
  }
}

const Users = new UserDatabaseInstance(USERS_COLLECTION);

module.exports = { Users };
