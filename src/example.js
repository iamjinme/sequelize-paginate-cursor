/**
 * Created by mirabalj on 10/11/16.
 */
import dotenv from 'dotenv';
import Sequelize from 'sequelize';
import _ from 'lodash';

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

export const paginate = (Model, { name } = {}) => {
  // Pagination using cursor is here!
  const results = async function ({
    sinceId, maxId, limit = 1,
    select, where = {},
    keyPaginated = 'id', reverse = false,
  } = {}, callback) {
    try {
      const lsThanE = reverse ? '$gte' : '$lte';
      const lsThan = reverse ? '$gt' : '$lt';
      const gsThan = reverse ? '$lt' : '$gt';
      const findObject = where;
      const findCursor = {};

      if (sinceId) {
        findCursor[lsThanE] = sinceId;
        findObject[keyPaginated] = findCursor;
      }

      if (maxId) {
        findCursor[gsThan] = maxId;
        findObject[keyPaginated] = findCursor;
      }

      // Execute query with limit
      const objects = await this.findAll({ where, limit });
      // Is reverse?
      if (reverse) {
        _.reverse(objects);
      }

      let nextCursor = undefined;
      const len = objects.length;

      // TODO: Create nextCursor object

      // Search fine? create a cursor!
      if (len) {
        const lastCursor = objects[len - 1][keyPaginated];
        const findNextCursorWhere = where;
        const findNextCursor = {};
        findNextCursor[lsThan] = lastCursor;
        findNextCursorWhere[keyPaginated] = findNextCursor;

        const nextObject = await this.findOne(findNextCursorWhere);

        if (nextObject) {
          nextCursor = nextObject[keyPaginated];
        }
      }

      // Create paginate object
      const objectReturn = {
        objects,
        nextCursor,
      };

      // Call back, ¿exist?
      if (callback) {
        callback(null, objectReturn);
      }

      // Return paginate
      return objectReturn;
    } catch (err) {
      // Catch error and send to callback
      callback(err);
      throw err;
    }
  };
  // Assign the function as the name identifier
  if (name) {
    Model[name] = results;
  } else {
    Model.paginate = results;
  }
};

export const checkConnection = async () => {
  let connect;
  try {
    connect = sequelize.authenticate();
  } catch (err) {
    throw Error('SEQUALIZE ERROR');
  }
  return await connect;
};

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
  paginate(User);
  return User;
};

export const createUser = async (data) => {
  let userCreated;
  const User = createModel();
  if (User) {
    userCreated = await User.create(data);
  }
  return userCreated;
};

export const searchUsers = async (parameters) => {
  const User = createModel();
  return await User.paginate(parameters);
};
