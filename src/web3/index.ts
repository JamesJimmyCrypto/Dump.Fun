import { Metaplex } from "@metaplex-foundation/js";
import { getConnection, keyPairFromB58 } from "./utils";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createPumpBuyInstruction, createPumpSellInstruction, getAccountData, getBondingCurve, getTokenAccount, signAndConfirmTransaction } from "./config";
import { TOKEN_PROGRAM_ID } from "./constants";
import { config } from "dotenv"
import { getAssociatedTokenAddress } from "@solana/spl-token";

config()

export const buy = async (mint: PublicKey, buyAmount: number, tokenOut: number) => {
    const connection = getConnection()

    const payer = keyPairFromB58(process.env.SECRET_KEY!)
    console.log(payer.publicKey, payer.secretKey)

    const balance = await connection.getBalance(payer.publicKey)
    console.log(balance)

    if((balance / LAMPORTS_PER_SOL) > buyAmount) {
        const taDestination = await getAssociatedTokenAddress(mint, payer.publicKey)
        console.log(taDestination)

        const { bondingCurve, associatedBondingCurve } = await getBondingCurve(mint)
        console.log(bondingCurve, associatedBondingCurve)

        const tx = createPumpBuyInstruction(
            mint,
            bondingCurve,
            associatedBondingCurve,
            taDestination,
            payer,
            BigInt(buyAmount * LAMPORTS_PER_SOL),
            BigInt(tokenOut * 10**6),
            TOKEN_PROGRAM_ID
        )

        return await signAndConfirmTransaction(connection, payer, [tx])
    } else {
        return [false, ""]
    }
}

export const sell = async (mint: PublicKey, amount: number, minSolOut: number) => {
    const connection = getConnection()

    const payer = keyPairFromB58(process.env.SECRET_KEY!)
    console.log(payer.publicKey, payer.secretKey)

    const balance = await connection.getBalance(payer.publicKey)
    console.log(balance)

    const tokenAccount = await getTokenAccount(connection, payer.publicKey, mint)
    console.log(tokenAccount)

    const taDestination = await getAssociatedTokenAddress(mint, payer.publicKey)
    console.log(taDestination)

    const { bondingCurve, associatedBondingCurve } = await getBondingCurve(mint)
    console.log(bondingCurve, associatedBondingCurve)

    const tx = createPumpSellInstruction(
        mint,
        bondingCurve,
        associatedBondingCurve,
        taDestination,
        payer,
        BigInt(minSolOut * LAMPORTS_PER_SOL),
        BigInt(amount * 10**6),
        TOKEN_PROGRAM_ID
    )

    return await signAndConfirmTransaction(connection, payer, [tx])
}

export const getTokenInfo = async (mint: PublicKey) => {
    const connection = getConnection()
    const metaplex = Metaplex.make(connection)

    const metadataAccount = metaplex.nfts().pdas().metadata({ mint })
    const metadataAccountData = await getAccountData(connection, metadataAccount)
    console.log(metadataAccount, metadataAccountData)

    if(metadataAccountData) {
        const token = await metaplex.nfts().findByMint({ mintAddress: mint })

        return {
            name: token.name,
            symbol: token.symbol,
            logo: token.json?.image
        }
    } else {
        return "Token does not support Metaplex metadata hence token details cannot be provided."
    }
}