
import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import {InsightResponse} from "../src/controller/IInsightFacade";
import fs = require("fs");
import JSZip = require("jszip");
import Response = ChaiHttp.Response;


describe("ServerSpec", function () {

    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    //create instance of server with port number 4321
    let server = new Server(4321);

    //require chai, chai-http
    var chai = require('chai'), chaiHttp = require('chai-http')
    chai.use(chaiHttp);

    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
        server.start();
    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);

    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
        server.stop();
    });

    afterEach(function () {

    });


    it("PUT new dataset (204)", function () {
        var options = {base64: true};
        return chai.request('http://localhost:4321')
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("rooms.zip", options), "rooms.zip")
            .then(function (res: Response) {
                expect(res.status).to.be.equal(204);
            })
            .catch(function (err: any) {
                console.log(err);
            });
    });

    it("PUT existing dataset (201)", function () {
        var options = {base64: true};
        return chai.request('http://localhost:4321')
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("rooms.zip", options), "rooms.zip")
            .then(function (res: Response) {
                expect(res.status).to.be.equal(201);
            })
            .catch(function (err: any) {
                console.log(err);
            });
    });

    it("PUT nonvalid dataset(400)", function () {
        var options = {base64: true};
        return chai.request('http://localhost:4321')
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("nonvalid.zip", options), "nonvalid.zip")
            .then(function (res: Response) {
                expect.fail();
            })
            .catch(function (err: any) {
                expect(err.status).to.be.equal(400);
            });
    });

    it("POST valid query (200)", function () {
        return chai.request('http://localhost:4321')
            .post('/query')
            .send({
                "WHERE":{
                    "EQ":{
                        "rooms_seats":20
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "rooms_number",
                        "rooms_furniture",
                        "rooms_seats"
                    ],
                    "ORDER":"rooms_seats",
                    "FORM":"TABLE"
                }
            })
            .then(function (res: any) {
                expect(res.status).to.be.equal(200);
                expect(res.body.result.length).to.be.equal(13);
            })
            .catch(function (err: any) {
                console.log(err);
            });
    });

    it("POST invalid query (400)", function () {
        return chai.request('http://localhost:4321')
            .post('/query')
            .send({
                "WHERE":{
                    "EQ":{
                        "rooms_seats":20
                    }
                }
            })
            .then(function (res: any) {
                expect.fail();
            })
            .catch(function (err: any) {
                expect(err.status).to.be.equal(400);
            });
    });

    it("POST invalid query (424)", function () {
        return chai.request('http://localhost:4321')
            .post('/query')
            .send({
                "WHERE": {
                    "GT": {
                        "dogs_pass": 9
                    }

                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_pass"
                    ],
                    "ORDER": "courses_pass",
                    "FORM":"TABLE"
                }
            })
            .then(function (res: any) {
                expect.fail();
            })
            .catch(function (err: any) {
                expect(err.status).to.be.equal(424);
            });
    });

    it("DELETE existing dataset (204)", function () {
        var options = {base64: true};
        return chai.request('http://localhost:4321')
            .del('/dataset/rooms')
            .attach("body", fs.readFileSync("rooms.zip", options), "rooms.zip")
            .then(function (res: Response) {
                expect(res.status).to.be.equal(204);
            })
            .catch(function (err: any) {
                console.log(err);
            });
    });

    it("DELETE no dataset (404)", function () {
        var options = {base64: true};
        return chai.request('http://localhost:4321')
            .del('/dataset/rooms')
            .attach("body", fs.readFileSync("rooms.zip", options), "rooms.zip")
            .then(function (res: Response) {
                expect.fail();
            })
            .catch(function (err: any) {
                expect(err.status).to.be.equal(404);
            });
    });

    it("GET / (implement in D4)", function () {
        var options = {base64: true};
        return chai.request('http://localhost:4321')
            .get('/')
            .then(function (res: Response) {
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err: any) {
                console.log(err);
            });
    });


});
