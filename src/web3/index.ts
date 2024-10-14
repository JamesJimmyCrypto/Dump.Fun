import { Metaplex } from "@metaplex-foundation/js";
import { getConnection, keyPairFromB58 } from "./utils";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { calculate_price_from_bonding_curve, createPumpBuyInstruction, createPumpSellInstruction, getAccountData, getBondingCurve, getTokenAccount, signAndConfirmTransaction } from "./config";
import { EVENT_AUTHORITY, PRIORITY_FEE_INSTRUCTION, TOKEN_PROGRAM_ID } from "./constants";
import { config } from "dotenv"
import { getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { TradeEventLayout } from "./layout";
import PUMP_FUN_IDL from "./pump-fun.json";
import { Program, AnchorProvider, Idl, Wallet } from "@coral-xyz/anchor";
import { Pump_Fun_Idl } from "./types";
import { tokenExists } from "../db/utils"
import { createToken, updateToken } from "../db";

config()

export const buy = async (mint: PublicKey, buyAmount: number) => {
    const connection = getConnection()

    const payer = keyPairFromB58(process.env.SECRET_KEY!)
    console.log(payer.publicKey, payer.secretKey)

    const balance = await connection.getBalance(payer.publicKey)
    console.log(balance)

    const token = await getTokenInfo(mint)
    console.log(token)

    if((balance / LAMPORTS_PER_SOL) > buyAmount) {
        const taDestination = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey)
        console.log(taDestination)

        const { bondingCurve, associatedBondingCurve } = await getBondingCurve(mint)
        console.log(bondingCurve, associatedBondingCurve)

        const price = await calculate_price_from_bonding_curve(connection, bondingCurve, token.decimals!)
        console.log(price)

        const tokenOut = buyAmount / price
        console.log(tokenOut)

        const tx = createPumpBuyInstruction(
            mint,
            bondingCurve,
            associatedBondingCurve,
            taDestination.address,
            payer,
            BigInt(buyAmount * LAMPORTS_PER_SOL),
            BigInt(Math.round(tokenOut) * 10**token.decimals!),
            TOKEN_PROGRAM_ID
        )
        console.log(tx)

        return await signAndConfirmTransaction(connection, payer, [tx, PRIORITY_FEE_INSTRUCTION])
    } else {
        return [false, ""]
    }
}

export const sell = async (mint: PublicKey, amount: number) => {
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

        const price = await calculate_price_from_bonding_curve(connection, bondingCurve, token.decimals!)
        console.log(price)

        const minSolOut = amount * price
        console.log(minSolOut)

        const tx = createPumpSellInstruction(
            mint,
            bondingCurve,
            associatedBondingCurve,
            taDestination,
            payer,
            BigInt(Math.round(minSolOut) * LAMPORTS_PER_SOL),
            BigInt(amount * 10**token.decimals!),
            TOKEN_PROGRAM_ID
        )
        console.log(tx)

        return await signAndConfirmTransaction(connection, payer, [tx, PRIORITY_FEE_INSTRUCTION])
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
            description: token.json?.description,
            decimals: token.mint?.decimals,
            image_uri: token.json?.image
        }
    } else {
        return {
            name: null,
            symbol: null,
            decimals: null,
            logo: null,
            msg: "Token does not support Metaplex metadata hence token details cannot be provided."
        }
    }
}

export const indexer = async () => {
    const connection = getConnection()

    const keyPair = keyPairFromB58(`${process.env.SECRET_KEY}`)
    const wallet = new Wallet(keyPair)

    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" })
    const address = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"

    const program = new Program<Pump_Fun_Idl>(PUMP_FUN_IDL as unknown as Pump_Fun_Idl, address, provider)

    program.addEventListener("TradeEvent", async (e, slot, sig) => {
        if(e.isBuy) {
            const exists = await tokenExists(e.mint.toString())
            console.log(exists, e, slot, sig)

            if(exists) {
                const token = await updateToken(e.mint.toString())
                console.log(token)
            } else {
                const token = await createToken(e.mint.toString())
                console.log(token)
            }
        }
    })
}