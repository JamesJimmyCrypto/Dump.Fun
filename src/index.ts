import express, { Request, Response } from "express";
import { config } from "dotenv";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { buy, getTokenInfo, sell } from "./web3/index"
import { keyPairToB58 } from "./web3/utils";

const app = express()

config()

app.use(express.json())

app.get("/", (req: Request, res: Response) => {
    res.send("Server is active & running.")
})

app.post("/buy", async (req: Request, res: Response) => {
    const params = req.body
    console.log(params)

    const [result, txId] = await buy(
        params.token,
        BigInt(params.buyAmount * LAMPORTS_PER_SOL),
        BigInt(params.tokenOut * 10**6),
    )

    if(result) {
        res.send(`Transaction sent: https://explorer.solana.com/tx/${txId}.`)
    } else {
        res.send("Unable to complete the transaction.")
    }
})

app.post("/sell", async (req: Request, res: Response) => {
    const params = req.body
    console.log(params)

    const [result, txId] = await sell(
        params.token,
        BigInt(params.amount * 10**6),
        BigInt(params.minSolOut * LAMPORTS_PER_SOL),
    )

    if(result) {
        res.send(`Transaction sent: https://explorer.solana.com/tx/${txId}.`)
    } else {
        res.send("Unable to complete the transaction.")
    }
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