import StarServer, { Response, Request } from "./starnode.js";

//const server: StarServer = new StarServer({
    //'/': [(req: Request, res: Response) => {
        //return res.send("<h1>✨ New node system ! ✨</h1>");
    //}, 'GET'],
    //'/api': [(req: Request, res: Response) => {
        //return "Yes";
    //}, 'POST'],
//});

const server: StarServer = new StarServer({
    'GET' : {
        '/': (req: Request, res: Response) => {
            return res.send("<h1>✨ New node system ! ✨</h1>");
        },
        '/api': (req: Request, res: Response) => {
            return res.send("<h1>🧙 New node system api ! 🧙</h1>");
        },
    },
    'POST': {
        '/api': (req: Request, res: Response) => {
            return { success: true, message : "🔮 Magic with star API ! 🔮" };
        },
    },
});
const port: number = 3000;

server.listen(port, () => {
    console.log(`⭐ http://localhost:${port}/ ⭐`);
});