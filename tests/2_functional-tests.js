const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let testIssueId;

    /*      CREATE      */
    /*                  */

    // 1 - POST: complete
    test('POST request - valid', function(done) {
        chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apiFuncTest')
        .send({
            issue_title: "Test1",
            issue_text: "Post request - full",
            created_by: "em-latic",
            assigned_to: "femur",
            status_text: "new"
        })
        .end(function (err, res) {
            assert.equal(res.status, 201);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.open, true);
            testIssueId = res.body._id;
            done();
        });
    });

    // 2 - POST: minimum
    test('POST request - minimum', function(done) {
        chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apiFuncTest')
        .send({
            issue_title: "Test2",
            issue_text: "Post request - minimal",
            created_by: "em-latic"
        })
        .end(function (err, res) {
            assert.equal(res.status, 201);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.open, true);              console.log(res.body);
            done();
        });
    });

    //Create an issue with missing required fields: POST request to /api/issues/{project}
    // 3 - POST: missing
    test('POST request - missing', function(done) {
        chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apiFuncTest')
        .send({
            issue_title: "Test3",
            issue_text: "Post request - missing data"
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.deepEqual(res.body, { error: "required field(s) missing" });
            done();
        });
    });


    /*      READ      */
    /*                */

    // View issues on a project: GET request to /api/issues/{project}
    // 4 - GET:
    test('GET request - valid', function(done) {
        chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apiFuncTest')
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isDefined(res.body);
            //console.log(res.body);
            done();
        });
    });

    // View issues on a project with one filter: GET request to /api/issues/{project}
    // 5 - GET: filtered
    test('GET request - 1 filter', function(done) {
        chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apiFuncTest?issue_title=Test1')
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isDefined(res.body); //console.log(res.body[0]);                
            assert.equal(res.body[0].issue_title, "Test1");
            done();
        });
    });

    // View issues on a project with multiple filters: GET request to /api/issues/{project}
    // 6 - GET: filtered
    test('GET request - multiple filters', function(done) {
        chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apiFuncTest?issue_title=Test2&created_by=em-latic&open=true') //
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isDefined(res.body);
                
            const expectResp = res.body[0];                         //console.log(res.body);
            assert.equal(expectResp.issue_title, "Test2");
            assert.equal(expectResp.created_by, "em-latic");
            assert.equal(expectResp.open, true);
            done();
        });
    });


    /*      UPDATE      */
    /*                  */

    // Update one field on an issue: PUT request to /api/issues/{project}
    // 7 - PUT: 1 field
    test('PUT request - 1 field ', function(done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apiFuncTest') //open=true
        .send({
            _id: testIssueId,
            issue_title: "Test-PUT-1",
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.deepEqual(res.body, { result: "successfully updated", _id: testIssueId });      
            done();
        });
    });

    // Update multiple fields on an issue: PUT request to /api/issues/{project}
    // 8 - PUT: mult. fields
    test('PUT request - x fields ', function(done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apiFuncTest') //open=true
        .send({
            _id: testIssueId,
            issue_title: "Test-PUT-2",
            open: false
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.deepEqual(res.body, { result: "successfully updated", _id: testIssueId });      
            done();
        });
    });


    // Update an issue with missing _id: PUT request to /api/issues/{project}
    // 9 - PUT: missing ID
    test('PUT request - missing _id ', function(done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apiFuncTest')
        .send({ issue_title: "Test-PUT-3" })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.deepEqual(res.body, { error: 'missing _id' });  
            done();
        });
    });

    // Update an issue with no fields to update: PUT request to /api/issues/{project}
    // 10 - PUT: no fields
    test('PUT request - N0 fields ', function(done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apiFuncTest')
        .send({ _id: testIssueId })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: testIssueId });      
            done();
        });
    });

    // Update an issue with an invalid _id: PUT request to /api/issues/{project}
    // 11 - PUT: invalid ID
    test('PUT request - invalid ID ', function(done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apiFuncTest')
        .send({ 
            _id: testIssueId.concat('abc123X'),
            issue_title: "Invalid ID"
         })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.deepEqual(res.body, { error: 'could not update', _id: testIssueId.concat('abc123X') });      
            done();
        });
    });


    /*      DELETE      */
    /*                  */

    // Delete an issue: DELETE request to /api/issues/{project}
    // 12 - DELETE: valid ID
    test('DELETE request - by _id', function (done) {
        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apiFuncTest')
        .send({ _id: testIssueId })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.deepEqual(res.body, { result: "successfully deleted", _id: testIssueId });
            done();
        });
    }); 

    // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
    // 13 - DELETE: invalid ID
    test('DELETE request - invalid _id', function (done) {
        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apiFuncTest')
        .send({ _id: testIssueId.concat('abc123X') })
        .end(function (err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.type, 'application/json');
            assert.deepEqual(res.body, { error: "could not delete", _id: testIssueId.concat('abc123X') });
            done();
        });
    }); 

    // Delete an issue with missing _id: DELETE request to /api/issues/{project}
    // 14 - DELETE: missing ID
    test('DELETE request - missing _id', function (done) {
        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apiFuncTest')
        .send({ issue_text: "Missing ID" })
        .end(function (err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.type, 'application/json');
            assert.deepEqual(res.body, { error: "missing _id" });
            done();
        });
    }); 
});
