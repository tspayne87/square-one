import 'reflect-metadata';
import { assert } from 'chai';
import 'mocha';

import { Connection, Query } from '../src';
import { Person } from './models/person.model';
import { Address } from './models/address.model';
import { PersonService } from './services/person.service';
import { AddressService } from './services/address.service';
import { PersonByFirstNameSpec } from './specs/PersonByFirstNameSpec';

describe('Connection - Tests', function() {
    const conn = new Connection();
    conn.addModels(Address, Person);

    const service = new PersonService(conn);
    const addressService = new AddressService(conn);

    before(function (done) {
        conn.listen({
            logging: false,
            dialect: 'mssql',
            dialectModulePath: 'sequelize-msnodesqlv8',
            dialectOptions: {
                connectionString: 'Driver={SQL Server Native Client 11.0};Server=TETHYS;Database=TestApp;Trusted_Connection=yes;'
            }
        })
            .then(() => done())
            .catch(err => done(err));
    });

    it('Create Person', (done) => {
        let person = new Person();
        person.FirstName = 'John';
        person.LastName = 'Doe';
        person.Birthday = new Date(2000,1,1);

        service.save(person)
            .then((person) => {
                let address = new Address();
                address.Line1 = '2293 Some Street';
                address.City = 'Some City';
                address.State = 'TN';
                address.Zip = '95684';
                address.personId = person[0].id;
                addressService.save(address)
                    .then(() => done())
                    .catch(err => done(err));
            })
            .catch(err => done(err));
    });

    it('Find by FirstName', (done) => {
        const query = new Query(conn, Person)
            .where(new PersonByFirstNameSpec('John'))
            .include(x => x.Addresses);
        service.findOne(query)
            .then(result => {
                assert.notEqual(result, null);
                if (result !== null) {
                    assert.equal(result.FirstName, 'John');
                    assert.equal(result.LastName, 'Doe');
                    assert.equal(new Date(result.Birthday).toString(), new Date(2000,1,1).toString());

                    assert.equal(result.Addresses[0].Line1, '2293 Some Street');
                    assert.equal(result.Addresses[0].City, 'Some City');
                    assert.equal(result.Addresses[0].State, 'TN');
                    assert.equal(result.Addresses[0].Zip, '95684');
                    assert.equal(result.Addresses[0].personId, result.id);
                }
                done();
            })
            .catch(err => done(err));
    });

    it('Destroy Person', (done) => {
        const query = new Query(conn, Person)
            .where(new PersonByFirstNameSpec('John'))
            .include(x => x.Addresses);
        service.findOne(query)
            .then(result => {
                if (result !== null) {
                    addressService.destroy.apply(addressService, result.Addresses)
                        .then(() => {
                            service.destroy(result)
                                .then(() => done())
                                .catch(err => done(err));
                        })
                        .catch(err => done(err));
                } else {
                    done('Person not found');
                }
            })
            .catch(err => done(err));
    });

    after(function(done) {
        conn.close()
            .then(() => done())
            .catch(err => done(err));
    });
});