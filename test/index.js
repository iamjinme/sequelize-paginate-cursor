import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import chaiAsPromised from 'chai-as-promised';
import { it } from 'arrow-mocha/es5';
import * as Paginate from '../lib';

chai.use(chaiAsPromised);
chai.use(dirtyChai);

describe('Paginate plugin', () => {
  it('should return ENV configuration', () => {
    const database = process.env;
    expect(database).to.be.an('object').with.property('DATABASE');
  });
  it('should connect to database or an error', async () => {
    try {
      const response = await Paginate.checkConnection();
      expect(response).to.be.an('undefined');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err).to.have.property('message').equal('SEQUALIZE ERROR CONNECTION');
    }
  });
  it.skip('should create a model', async () => {
    const model = Paginate.createModel();
    expect(model).to.be.an('object').with.property('paginate');
  });
  it.skip('should create a user', async () => {
    const userToCreate = {
      firstName: 'John',
      lastName: 'Doe',
    };
    const user = await Paginate.createUser(userToCreate);
    expect(user).to.be.an('object').with.property('id');
  });
  it('should paginate a search', async () => {
    const results = await Paginate.searchUsers({
      where: { firstName: 'John' },
      limit: 3,
    });
    console.log('nextCursor', results.nextCursor);
  });
});
