import express, { Request, Response } from "express";
import { config } from "dotenv";

const app = express()

config()

app.use(express.json())

app.get("/", (req: Request, res: Response) => {
    res.send("Server is active & running.")
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}.`)
})