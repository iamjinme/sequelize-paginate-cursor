/**
 * Created by mirabalj on 10/11/16.
 */
import dotenv from 'dotenv';
import Sequelize from 'sequelize';
import _debug from 'debug';
import pagination from '../lib/pagination';

const debug = _debug('sequelizeCursor:connection');
const error = _debug('sequelizeCursor:error');

dotenv.config();

const database = process.env.DATABASE || 'example';
const username = process.env.USERNAME || 'root';
const password = process.env.PASSWORD;
const dialect = process.env.DIALECT || 'mysql';
const port = process.env.PORT || 3306;

const sequelize = new Sequelize(database, username, password, {
  dialect,
  port,
});

/**
 * Check the connection to database
 * @returns Promise
 */
export const checkConnection = async () => {
  let connect;
  try {
    connect = await sequelize.authenticate();
  } catch (err) {
    throw Error('SEQUELIZE ERROR CONNECTION');
  }
  return connect;
};

/**
 * Create User model
 * @returns {Model}
 */
export const createModel = () => {
  const User = sequelize.define('user', {
    firstName: {
      type: Sequelize.STRING,
      field: 'first_name',
    },
    lastName: {
      type: Sequelize.STRING,
      field: 'last_name',
    },
  }, {
    timestamps: false, // Not timestamps
    freezeTableName: true, // Model tableName will be the same as the model name
  });
  pagination(User);
  return User;
};

/**
 * Create a record in a table
 * @param Model, Data
 * @returns Promise
 */
export const createRecord = async (model, data) => {
  let recordCreated;
  if (model) {
    recordCreated = await model.create(data);
  }
  return recordCreated;
};

/**
 * Search users with paginate parameters
 * @param {parameters}
 * @returns Promise
 */
export const searchUsers = async (parameters) => {
  const User = createModel();
  return await User.paginate(parameters);
};

/**
 * Generate a random string
 * @param len
 * @returns {string}
 */
export const randomString = (len) => {
  const string = Math.random().toString(36).replace(/[^a-z]+/g, '');
  return string.substr(0, len);
};

// Validate the connection
const connect = checkConnection();
connect.then(() => {
  // Create a user model
  const model = createModel();
  // Recreate model
  model.sequelize.sync({
    force: true,
  });
  // Save a random record each 10 seconds
  setInterval(async () => {
    debug('will create new user');
    try {
      // Data with random string
      const user = await createRecord(model, {
        firstName: randomString(24),
        lastName: randomString(24),
      });
      debug('created', user);
    } catch (err) {
      error(err);
    }
  }, 10000);
  let sinceId = null;
  // Execute a paginate with push key
  process.stdin.on('data', async(text) => {
    debug('input', text);
    try {
      const { objects, nextCursor } = await model.paginate({
        limit: 3,
        sinceId,
        reverse: false,
      });
      sinceId = nextCursor;
      debug('paged', { objects, nextCursor });
    } catch (err) {
      error(err);
    }
  });
}).catch((err) => {
  error(err);
});
