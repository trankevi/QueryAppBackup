/**
 * This is the REST entry point for the project.
 * Restify is configured here.
 */

import restify = require('restify');
import Log from "../Util";
import {IInsightFacade, InsightResponse, QueryRequest} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";

/**
 * This configures the REST endpoints for the server.
 */
export default class Server {

    private port: number;
    private rest: restify.Server;

    constructor(port: number) {
        Log.info("Server::<init>( " + port + " )");
        this.port = port;
    }

    /**
     * Stops the server. Again returns a promise so we know when the connections have
     * actually been fully closed and the port has been released.
     *
     * @returns {Promise<boolean>}
     */
    public stop(): Promise<boolean> {
        Log.info('Server::close()');
        let that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }

    /**
     * Starts the server. Returns a promise with a boolean value. Promises are used
     * here because starting the server takes some time and we want to know when it
     * is done (and if it worked).
     *
     * @returns {Promise<boolean>}
     */
    public start(): Promise<boolean> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Log.info('Server::start() - start');

                that.rest = restify.createServer({
                    name: 'insightUBC'
                });

                that.rest.use(restify.bodyParser({mapParams: true, mapFiles: true}));
                that.rest.get("/public/.*", restify.serveStatic({
                    directory: __dirname
                }));
               
              
                that.rest.get('/:name', restify.serveStatic({
                    directory: __dirname + '/view',
                    default: 'index.html'        //if cant find content, will just serve this page
                }));                             

                // Other endpoints will go here

                // get query interface for UI
                that.rest.get('/', Server.getQueryInterface);

                // put dataset
                // put(path, send)
                that.rest.put('/dataset/:id', Server.putDataset);

                // delete dataset
                // del(path, rm)
                that.rest.del('/dataset/:id', Server.deleteDataset);

                // post query
                // put(path, send)
                that.rest.post('/query', Server.postQuery);

                that.rest.listen(that.port, function () {
                    Log.info('Server::start() - restify listening: ' + that.rest.url);
                    fulfill(true);
                });

                that.rest.on('error', function (err: string) {
                    // catches errors in restify start; unusual syntax due to internal node not using normal exceptions here
                    //Log.info('Server::start() - restify ERROR: ' + err);
                    reject(err);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    public static getQueryInterface(req: restify.Request, res: restify.Response, next: restify.Next) {
        res.send(200);
        return next();
    }

    public static putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            let insightfacade = new InsightFacade();
            let dataStr = new Buffer(req.params.body).toString('base64');

            insightfacade.addDataset(req.params.id, dataStr)
                .then(function (insightresponse: InsightResponse){
                    res.json(insightresponse.code, insightresponse.body);
                })
                .catch(function (err: any){
                    res.json(err.code, err.body);
                });
        } catch (err) {
            res.json(400, {error: err.message});
        }
        return next();
    }

    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            let insightfacade = new InsightFacade();

            insightfacade.removeDataset(req.params.id)
                .then(function (insightresponse: InsightResponse){
                    res.json(insightresponse.code, insightresponse.body);
                })
                .catch(function (err: any){
                    res.json(err.code, err.body);
                });

        } catch (err) {
            res.json(404, {error: err.message});
        }
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            let insightfacade = new InsightFacade();

            insightfacade.performQuery(req.body)
                .then(function (insightresponse: InsightResponse){
                    res.json(insightresponse.code, insightresponse.body);
                })
                .catch(function (err: any){
                    res.json(err.code, err.body);
                });

        } catch (err) {
            res.json(400, {error: err.message});
        }
        return next();
    }


}
