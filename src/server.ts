import StarServer, { Response, Request } from "./starnode.js";

const port: number = 3000;
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
        '/api': async (req: Request, res: Response) => {
            const body = await req.body;
            return { success: true, message : "🔮 Magic with star API ! 🔮" };
        },
    },
});

server.listen(port, () => {
    console.log(`⭐ http://localhost:${port}/ ⭐`);
});