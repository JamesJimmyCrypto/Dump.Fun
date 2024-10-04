import express, { Request, Response } from "express";
import { config } from "dotenv";
import { PublicKey } from "@solana/web3.js";
import { getTokenInfo } from "./web3/index"

const app = express()

config()

app.use(express.json())

app.get("/", (req: Request, res: Response) => {
    res.send("Server is active & running.")
})

app.post("/buy", (req: Request, res: Response) => {

})

app.post("/sell", (req: Request, res: Response) => {

})

app.get("/token/:address", async (req: Request, res: Response) => {
    const address = req.params.address
    const token = new PublicKey(address)
    console.log(address, token)

    const tokenInfo = await getTokenInfo(token)
    console.log(tokenInfo)

    res.send(tokenInfo)
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}.`)
})