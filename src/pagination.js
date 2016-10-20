/**
 * Created by mirabalj on 10/12/16.
 */

export default (Model, { name } = {}) => {
  // Pagination using cursor is here!
  const results = async function any({
    sinceId, maxId, limit = 1,
    select, where = {},
    keyPaginated = 'id', reverse = false,
    include = [], subQuery = true,
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

      // Assign order of search
      const order = keyPaginated + (reverse ? '' : ' DESC');

      // Execute query with limit
      const objects = await this.findAll({
        where,
        subQuery,
        include,
        limit,
        attributes: select,
        order,
      });

      let nextCursor = undefined;
      const len = objects.length;

      // Search fine? create a cursor!
      if (len) {
        const lastCursor = objects[len - 1][keyPaginated];
        const findNextCursorWhere = where;
        const findNextCursor = {};
        findNextCursor[lsThan] = lastCursor;
        findNextCursorWhere[keyPaginated] = findNextCursor;
        // Find next cursor
        const nextObject = await this.findOne({
          where: findNextCursorWhere,
          subQuery,
          include,
          order,
        });
        // Exist next cursor?
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
      if (callback) callback(err);
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
