import express, { Request, Response } from "express";
import { config } from "dotenv";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { buy, getTokenInfo, indexer, sell } from "./web3/index"
import { getSolPriceInUSD, keyPairToB58 } from "./web3/utils";
import { connectDB } from "./db/utils";
import { EVENT_AUTHORITY, FEE_RECIPIENT, GLOBAL, MINT_AUTHORITY, TOKEN_PROGRAM_ID } from "./web3/constants";

connectDB()

const app = express()

config()

app.use(express.json())

app.get("/", async (req: Request, res: Response) => {
    const isPDA = !PublicKey.isOnCurve(EVENT_AUTHORITY)
    console.log(isPDA)

    res.send("Server is active & running.")
})

app.post("/buy", async (req: Request, res: Response) => {
    const params = req.body
    console.log(params)

    const [result, txId] = await buy(
        new PublicKey(params.token),
        params.amount
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
        new PublicKey(params.token),
        params.amount
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

indexer()

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}.`)
})