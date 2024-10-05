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

    const token = await getTokenInfo(mint)
    console.log(token)

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
            BigInt(tokenOut * 10**token.decimals!),
            TOKEN_PROGRAM_ID
        )
        console.log(tx)

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

    const token = await getTokenInfo(mint)
    console.log(token)

    if((amount * 10**token.decimals!) <= Number(tokenAccount?.amount)) {
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
            BigInt(amount * 10**token.decimals!),
            TOKEN_PROGRAM_ID
        )
        console.log(tx)

        return await signAndConfirmTransaction(connection, payer, [tx])
    } else {
        return [false, ""]
    }
}

export const getTokenInfo = async (mint: PublicKey) => {
    const connection = getConnection()
    const metaplex = Metaplex.make(connection)

    const metadataAccount = metaplex.nfts().pdas().metadata({ mint })
    const metadataAccountData = await getAccountData(connection, metadataAccount)
    console.log(metadataAccount, metadataAccountData)

    if(metadataAccountData) {
        const token = await metaplex.nfts().findByMint({ mintAddress: mint })
        console.log(token)

        return {
            name: token.name,
            symbol: token.symbol,
            decimals: token.mint?.decimals,
            logo: token.json?.image
        }
    } else {
        return {
            name: undefined,
            symbol: undefined,
            decimals: undefined,
            logo: undefined,
            msg: "Token does not support Metaplex metadata hence token details cannot be provided."
        }
    }
}