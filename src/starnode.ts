import http from 'http'

type ResponseHttp = http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
}

type RequestHttp = http.IncomingMessage;

type Callback = (req: Request, res: Response) => any;

type TypeRequest = 'GET' | 'POST';

type SNode = {
    [key: string]: Callback;
}

type SNodes = {
    [key in TypeRequest]: SNode;
};
export class Request {
    req: RequestHttp;
    headers: http.IncomingHttpHeaders;
    body: Promise<any>;

    constructor(req: RequestHttp) {
        this.req = req;
        this.headers = req.headers;
        this.body = this.processRequestBody();
    }

    private processRequestBody(): Promise<any> {
        return new Promise((resolve, reject) => {
            let body = '';
            switch (this.headers['content-type']) {
                case 'application/json':
                    this.req.on('data', (chunk: string) => {
                        body += chunk;
                    });
                    this.req.on('end', () => {
                        try {
                            const parsedBody = JSON.parse(body);
                            resolve(parsedBody);
                        } catch (error) {
                            console.error('Erreur lors de l\'analyse JSON :', error);
                            console.error('Données brutes reçues :', body);
                            reject(error);
                        }
                    });
                    this.req.on('error', (error: string) => {
                        console.error('Erreur lors de la réception des données :', error);
                        reject(error);
                    });
                    break;
                default:
                    resolve(body);
                    break;
            }
        });
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

type StarRoute = Map<string, Callback>;

export default class StarServer {
    private routes: Map<TypeRequest, StarRoute> = new Map();

    constructor(routes: SNodes) {
        Object.keys(routes).forEach((type: string) => {
            const routeMap: StarRoute = new Map();
            Object.keys(routes[type as TypeRequest]).forEach((route: string) => { 
                routeMap.set(route, routes[type as TypeRequest][route]);
            })
            this.routes.set(type as TypeRequest, routeMap);
        });
    };

    private err(res: ResponseHttp, code: number, message: string) {
        res.writeHead(code, { 'Content-Type': 'application/json' });
        return res.end(message);
    }

    public listen(port: number, callback: () => any) {
        const server = http.createServer(async (req, res) => {
            if (!req.method) return this.err(res, 404, "No Method");
            if (!req.url) return this.err(res, 404, "No url");
            const routeType = this.routes.get(req.method as TypeRequest);
            if (!routeType) return this.err(res, 404, "No type matching the query");
            const route = routeType.get(req.url);
            if (!route) return this.err(res, 404, "Page not found");
            const returnValue: any = await route(new Request(req), new Response(res));

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