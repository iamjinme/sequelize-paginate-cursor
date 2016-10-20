import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import chaiAsPromised from 'chai-as-promised';
import { it } from 'arrow-mocha/es5';
import * as Example from '../lib/example';

chai.use(chaiAsPromised);
chai.use(dirtyChai);

describe('Paginate plugin', () => {
  it('should return ENV configuration', () => {
    const database = process.env;
    expect(database).to.be.an('object').with.property('DATABASE');
  });
  it('should connect to database or an error', async () => {
    try {
      const response = await Example.checkConnection();
      expect(response).to.be.an('undefined');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err).to.have.property('message').equal('SEQUELIZE ERROR CONNECTION');
    }
  });
  it('should create a model user', async () => {
    const model = Example.createModel();
    expect(model).to.be.an('object').with.property('paginate');
  });
  it('should create a user example', async () => {
    const model = Example.createModel();
    await model.sequelize.sync({
      force: true,
    });
    const userToCreate = {
      firstName: 'John',
      lastName: 'Doe',
    };
    const user = await Example.createRecord(model, userToCreate);
    expect(user).to.be.an('object').with.property('id');
  });
  it('should paginate a search example', async () => {
    const results = await Example.searchUsers({
      where: { firstName: 'John' },
      subQuery: false,
      limit: 3,
    });
    expect(results).to.be.an('object').with.property('nextCursor');
  });
});
