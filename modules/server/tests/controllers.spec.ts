import { assert } from 'chai';
import 'mocha';
import { Application } from '../src/application';
import { Http } from './utils';
import * as fs from 'fs';
import * as path from 'path';

describe('{Controller}:/user', function() {
    let id = '4543-38483-29983-2093';
    let port = 8000;

    let http = new Http();
    let app = new Application({ cwd: __dirname, assetDir: 'assets' });
    app.register('controllers');

    let fileContents = fs.readFileSync(path.join(__dirname, 'assets', 'index.html')).toString();

    before(function (done) {
        app.listen(port);
        done();
    });

    it('{GET}:/user', (done) => {
        http.Get(`http://localhost:${port}/user`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal('Searching...', data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{GET}:/user/{id}', (done) => {
        http.Get(`http://localhost:${port}/user/${id}`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal(id, data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{GET}:/user/index', (done) => {
        http.Get(`http://localhost:${port}/user/index`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'text/html');
                assert.equal('<html><head></head><body><div id="app"></div></body><html>', data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{GET}:/user/{id}/path', (done) => {
        http.Get(`http://localhost:${port}/user/index/path`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal('index-path', data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{GET}:/user/{id}/before/callback', (done) => {
        http.Get(`http://localhost:${port}/user/index/before/callback`)
            .then((data) => {
                assert.equal(http.status, 401);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.deepEqual({ message: 'Unauthorized Attribute' }, data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{GET}:/user/*', (done) => {
        http.Get(`http://localhost:${port}/user/${id}/abort`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal('all-user', data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{GET}:/user/getToken/{token}', (done) => {
        http.Get(`http://localhost:${port}/user/getToken/${id}`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal(`special-${id}`, data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{POST}:/user', (done) => {
        http.Post(`http://localhost:${port}/user`, { id })
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.deepEqual({ id }, data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{DELETE}:/user/{id}', (done) => {
        http.Delete(`http://localhost:${port}/user/${id}`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal(true, data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{GET}:/*', (done) => {
        http.Get(`http://localhost:${port}`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal('index.html', data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{POST}:/test', (done) => {
        http.Post(`http://localhost:${port}/test`, { id })
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.deepEqual({ id }, data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{Get}:/index', (done) => {
        http.Get(`http://localhost:${port}/index`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'text/html');
                assert.deepEqual(fileContents, data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{Get}:/test/args', (done) => {
        http.Get(`http://localhost:${port}/test/args/hello?testBoolean=true&testNumber=999&testString=world&testDate=02-12-2010&testMixed=123-0459-3021`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');

                assert.equal(data.id, 'hello');
                assert.equal(data.testBoolean, true);
                assert.equal(data.testNumber, 999);
                assert.equal(data.testString, 'world');
                assert.equal(data.testDate, '2010-02-12T07:00:00.000Z');
                assert.equal(data.testMixed, '123-0459-3021');
                done();
            })
            .catch((err) => done(err));
    });

    it('{Get}:/long-url', (done) => {
        http.Get(`http://localhost:${port}/user/this/is/a/very/long/url/that/needs/to/be/tested/to/make/sure/it/is/working/properly`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.deepEqual('very-long-url', data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{Get}:/{id}/redirect', (done) => {
        http.Get(`http://localhost:${port}/user/test/redirect`)
            .then((data) => {
                assert.equal(http.status, 301);
                assert.equal(http.headers['content-type'], 'application/actet-stream');
                assert.equal(http.headers['location'], 'test/before/callback');
                assert.deepEqual('', data);
                done();
            })
            .catch((err) => done(err));
    });

    it('File Upload', (done) => {
        http.File(`http://localhost:${port}/user/upload`, __dirname + '/test-file.txt', 'test.txt')
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal(true, data);

                // Remove the file that was uploaded to the server and test if it is the same contents.
                let filePath = path.join(__dirname, 'uploads', 'user_upload.txt');
                let comparePath = path.join(__dirname, 'test-file.txt');
                fs.readFile(filePath, 'utf8', (err, contents) => {
                    if (err) return done(err);
                    fs.readFile(comparePath, 'utf8', (err, compareContents) => {
                        if (err) return done(err);
                        assert.equal(contents, compareContents);
                        fs.unlink(filePath, (err) => {
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            })
            .catch((err) => done(err));
    });

    it('Image Upload', (done) => {
        http.File(`http://localhost:${port}/user/upload`, __dirname + '/tux.png', 'test.png')
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal(true, data);

                // Remove the file that was uploaded to the server and test if it is the same contents.
                let filePath = path.join(__dirname, 'uploads', 'user_upload.png');
                let comparePath = path.join(__dirname, 'tux.png');
                fs.readFile(filePath, (err, contents) => {
                    if (err) return done(err);
                    fs.readFile(comparePath, (err, compareContents) => {
                        if (err) return done(err);
                        assert.equal(contents.length, compareContents.length);
                        for (let i = 0; i < compareContents.length; ++i) {
                            assert.equal(contents[i], compareContents[i]);
                        }
                        fs.unlink(filePath, (err) => {
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            })
            .catch((err) => done(err));
    });

    after(function(done) {
        app.close(done);
    });
});