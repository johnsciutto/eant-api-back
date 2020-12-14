const { MongoClient, ObjectId } = require('mongodb');

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
  try {
    const { client, collection } = await openCollection();
    const cursor = await collection.find({ $text: { $search: email } });
    const [result] = await cursor.toArray();
    await cursor.close();
    await client.close();
    return result || errors.emptyDatabase;
  } catch (error) {
    throw new Error(error);
  }
};

const findByUsername = async (name) => {
  try {
    const { client, collection } = await openCollection();
    const cursor = await collection.find({ $text: { $search: name } });
    const [result] = await cursor.toArray();
    await cursor.close();
    await client.close();
    return result || null;
  } catch (error) {
    throw new Error(error);
  }
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

const hasAccess = async (usr) => usr.access;

const isAdmin = async (usr) => usr.admin;

const isCorrectPassword = (user, pass) => (user.pass === pass);

const deleteAllUsersWithoutAccess = async () => {
  const { client, collection } = openCollection();
  const result = await collection.deleteMany({ access: false });
  await client.close();
  return result.deletedCount;
};

const deleteUserById = async (id) => {
  const { client, collection } = openCollection();

  const result = await collection.deleteOne({ _id: ObjectId(id) });
  await client.close();
  return result.deletedCount;
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
    if (
      !(isValidEmail(userObj.email)
        || userObj.access
        || userObj.name.length > 3)
    ) return null;

    const { client, collection } = await openCollection();
    const { insertedCount, insertedId } = await collection.insertOne(userObj);
    await client.close();
    return insertedCount ? insertedId : insertedCount;
  }

  async update(filter, changes) {
    const { email, _id, name } = changes;
    if (
      (email && !isValidEmail(email))
      || (_id && !isValidId(_id))
      || (name && !isValidUsername(name))
    ) return errors.noDocumentModified;
    const { client, collection } = await openCollection();
    const { modifiedCount } = await collection.updateOne(filter, { $set: { ...changes } });
    await client.close();
    return modifiedCount ? `${modifiedCount} item modified successfully` : errors.noDocumentModified;
  }

  async delete(filter, pass) {
    const user = await this.find(filter);
    if (user && isCorrectPassword(user.pass, pass)) return deleteUserById(user._id);
    return errors.noDocumentDeleted;
  }

  async deleteAllItems(pass) {
    if (pass !== DELETE_PASSWORD) return errors.noDocumentDeleted;
    const { client, collection } = await openCollection();
    const result = await collection.deleteMany({});
    await client.close();
    return result;
  }
}

const Users = new UserDatabaseInstance(USERS_COLLECTION);

module.exports = Users;
