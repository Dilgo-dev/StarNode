import http from 'http'

type ResponseHttp = http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
}

type RequestHttp = http.IncomingMessage;

type Callback = (req: Request, res: Response) => any;

type TypeRequest = 'GET' | 'POST';

type SNode = {
    [key: string]: [Callback, TypeRequest]
};
interface Route {
    type: string,
    callback: Callback;
}

export class Request {
    req: RequestHttp;
    headers: http.IncomingHttpHeaders;
    body: any;

    constructor(req: RequestHttp) {
        this.req = req;
        this.headers = req.headers;
        switch (this.headers['content-type']) {
            case 'application/json': 
                req.on('data', (chunk) => {
                    this.body = JSON.parse(chunk);
                });
                break; 
            default:
                break;
        }
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
        this.res.writeHead(this.statusCode, { 'Content-Type': 'text/html; charset=utf-8' })
        this.res.end(text);
        return;
    }

    public json(jsonObject: object) {
        try {
            const jsonString: string = JSON.stringify(jsonObject);
            this.res.writeHead(this.statusCode, { 'Content-Type': 'application/json' })
            this.res.end(jsonString);
        } catch (err) {
            console.log(err);
        }
        return;
    }
}

export default class StarServer {
    private routes: Map<string, Route> = new Map();

    constructor(routes: SNode) {
        Object.keys(routes).forEach((route: string) => {
            this.routes.set(route, {
                type: routes[route][1],
                callback: routes[route][0]
            });
        });
    };

    private err(res: ResponseHttp, code: number, message: string) {
        res.writeHead(code, { 'Content-Type': 'application/json' });
        return res.end(message);
    }

    public listen(port: number, callback: () => any) {
        const server = http.createServer((req, res) => {
            if (!req.url) return this.err(res, 404, "No url");
            console.log(req.url);
            console.log(this.routes);
            const route = this.routes.get(req.url);
            console.log(route);
            if (!route || route.type !== req.method) return this.err(res, 404, "Not Found");

            const returnValue: any = route.callback(new Request(req), new Response(res));
            switch (typeof returnValue) {
                case 'object':
                    new Response(res).json(returnValue);
                    break;
                case 'string':
                    new Response(res).send(returnValue);
                    break;
                default:
                    break;
            }
        });

        server.listen(port, callback);
    }
}