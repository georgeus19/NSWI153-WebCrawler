import express, { Express} from "express";

const app: Express = express();

const port = 3000;

app.get("/", async (req: any, res: any) => {
    res.send("ahoj");
  });

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
        
      