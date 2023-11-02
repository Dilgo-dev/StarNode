import http from 'http'

type ResponseHttp = http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
}

type RequestHttp = http.IncomingMessage;

type Callback = (req: RequestHttp, res: Response) => any;

interface Route {
    type: string,
    callback: Callback;
}

export class Request {
    res: ResponseHttp;
    statusCode: number = 200;

    constructor(res: ResponseHttp) {
        this.res = res;
    }

    public status(code: number): Response {
        this.statusCode = code;
        return this;
    }

    public send(text: string) {
        this.res.writeHead(this.statusCode, { 'Content-Type': 'text/plain' })
        this.res.end(text);
        return;
    }
}

export class Response {
    res: ResponseHttp;
    statusCode: number = 200;

    constructor(res: ResponseHttp) {
        this.res = res;
    }

    public status(code: number): Response {
        this.statusCode = code;
        return this;
    }

    public send(text: string) {
        this.res.writeHead(this.statusCode, { 'Content-Type': 'text/plain' })
        this.res.end(text);
        return;
    }
}

export default class StarNode {
    private routes: Map<string, Route> = new Map();

    constructor() {};

    public get(path: string, callback: Callback) {
        this.routes.set( path, { type: "GET", callback } );
    }

    private err(res: ResponseHttp, code: number, error: string) {
        res.writeHead(code, { 'Content-Type': 'text/plain' });
        return res.end(error);
    }

    public listen(port: number, callback: () => any) {
        const server = http.createServer((req, res) => {
            if (!req.url) return this.err(res, 404, "No url");
            const route = this.routes.get(req.url);
            if (!route) return this.err(res, 404, "Not Found");

            route.callback(req, new Response(res));
        });

        server.listen(port, callback);
    }
}

//const server = http.createServer((req, res) => {
    //if (req.method === 'GET' && req.url === '/api') {
        //res.writeHead(200, { 'Content-Type': 'application/json' });
        //res.end(JSON.stringify({ message: 'Hello from the API!' }));
    //} else {
        //res.writeHead(404, { 'Content-Type': 'text/plain' });
        //res.end('Not Found');
    //}
//});

//server.listen(port, () => {
    //console.log(`Server is listening on port ${port}`);
//});