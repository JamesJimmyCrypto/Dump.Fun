import { Metaplex } from "@metaplex-foundation/js";
import { getConnection, keyPairFromB58 } from "./utils";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import { createPumpBuyInstruction, createPumpSellInstruction, getAccountData, getBondingCurve, signAndConfirmTransaction } from "./config";
import { TOKEN_PROGRAM_ID } from "./constants";
import { config } from "dotenv"
import { getAssociatedTokenAddress } from "@solana/spl-token";

config()

export const buy = async (mint: PublicKey, buyAmount: bigint, tokenOut: bigint) => {
    const connection = getConnection()

    const payer = keyPairFromB58(process.env.SECRET_KEY!)
    console.log(payer.publicKey, payer.secretKey)
    const taDestination = await getAssociatedTokenAddress(mint, payer.publicKey)

    const { bondingCurve, associatedBondingCurve } = await getBondingCurve(mint)

    const tx = createPumpBuyInstruction(
        mint,
        bondingCurve,
        associatedBondingCurve,
        taDestination,
        payer,
        buyAmount,
        tokenOut,
        TOKEN_PROGRAM_ID
    )

    return await signAndConfirmTransaction(connection, payer, [tx])
}

export const sell = async (mint: PublicKey, amount: bigint, minSolOut: bigint) => {
    const connection = getConnection()

    const payer = keyPairFromB58(process.env.SECRET_KEY!)
    const taDestination = await getAssociatedTokenAddress(mint, payer.publicKey)

    const { bondingCurve, associatedBondingCurve } = await getBondingCurve(mint)

    const tx = createPumpSellInstruction(
        mint,
        bondingCurve,
        associatedBondingCurve,
        taDestination,
        payer,
        minSolOut,
        amount,
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