import { Connection, Keypair } from "@solana/web3.js";
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

export const getConnection = () => {
    if (process.env.NODE_ENV == "development") {
        return new Connection(`${process.env.DEVNET_CONNECTION_URL}`, "confirmed")
    } else {
        return new Connection(`${process.env.MAINNET_CONNECTION_URL}`, "confirmed")
    }
}