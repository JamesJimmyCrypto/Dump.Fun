import { Connection, Keypair } from "@solana/web3.js";
import axios from "axios";
import { encode, decode } from "bs58";
import { config } from "dotenv";

config()

export const keyPairToB58 = (keyPair: Keypair) => {
    return encode(keyPair.secretKey)
}

export const keyPairFromB58 = (secret: string) => {
    const decoded = decode(secret)
    
    return Keypair.fromSecretKey(decoded)
}

export const getSolPriceInUSD = async () => {
    const { data } = await axios.get("https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=5426",{
        headers: {
            "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY
        }
    })

    return data["data"]["5426"]["quote"]["USD"]["price"]
}

export const getConnection = () => {
    if (process.env.NODE_ENV == "development") {
        return new Connection(`${process.env.DEVNET_CONNECTION_URL}`, "confirmed")
    } else {
        return new Connection(`${process.env.MAINNET_CONNECTION_URL}`, {
            wsEndpoint: `${process.env.WSS_MAINNET_CONNECTION_URL}`,
            commitment: "confirmed"
        })
    }
}