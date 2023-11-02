import StarNode, { Response, Request } from "./starnode.js";

const app: StarNode = new StarNode();
const port: number = 3000;

function foo(res: Response, req: Request) {
    console.log("YES");
    res.send("YES");
}

const starRouter = {
    '/': () => {

    },
};

console.log(Object.keys(test));

app.get("/", (_, res: Response) => {
    console.log("OOOK");
    return res.status(200).send("ok");
});

app.listen(port, () => {
    console.log(`WOOOOW WORKNG ON ${port}`);
})