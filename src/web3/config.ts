import { ASSOCIATED_TOKEN_PROGRAM_ID, AccountLayout, getAssociatedTokenAddress } from "@solana/spl-token";
import { AccountMeta, Connection, Keypair, PublicKey, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { EVENT_AUTHORITY, FEE_RECIPIENT, GLOBAL, PumpFunInstruction, TOKEN_PROGRAM_ID } from "./constants";
import { PumpFunBuyInstructionLayout, PumpFunSellInstructionLayout } from "./layout";
import { RENT_PROGRAM_ID, TOKEN_PROGRAM_ID as RAYDIUM_TOKEN_PROGRAM_ID } from "@raydium-io/raydium-sdk";

export const getAccountData = async (connection: Connection, address: PublicKey) => {
    const accountInfo = await connection.getAccountInfo(address)
    console.log(accountInfo)

    return accountInfo?.data
}

export const getTokenAccount = async (connection: Connection, owner: PublicKey, mint: PublicKey) => {
    const associatedToken = await getAssociatedTokenAddress(mint, owner)

    const accountData = await getAccountData(connection, associatedToken)

    if (accountData) {
        const rawAccount = AccountLayout.decode(accountData)

        return {
            address: associatedToken,
            mint: rawAccount.mint,
            owner: rawAccount.owner,
            amount: rawAccount.amount
        }
    } else {
        return null
    }
}

export const getBondingCurve = async (mint: PublicKey) => {
    const [bondingCurve,] = PublicKey.findProgramAddressSync(
        [Buffer.from("bonding-curve"), mint.toBuffer()],
        TOKEN_PROGRAM_ID
    )

    const associatedBondingCurve = await getAssociatedTokenAddress(mint, bondingCurve, true)

    return { bondingCurve, associatedBondingCurve }
}

export function createPumpBuyInstruction(
    tokenMint: PublicKey,
    bondingCurve: PublicKey,
    associatedBondingCurve: PublicKey,
    taDestination: PublicKey,
    payer: Keypair,
    buyAmount: bigint,
    tokenOut: bigint,
    programId: PublicKey
): TransactionInstruction {
    const keys: AccountMeta[] = [
        // Account 1
        { pubkey: GLOBAL, isSigner: false, isWritable: false }, // Pump Fun
        // Account 2
        { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true }, // Pump Fun Fee Recipient
        // Account 3
        { pubkey: tokenMint, isSigner: false, isWritable: false }, // Token Mint
        // Account 4
        { pubkey: bondingCurve, isSigner: false, isWritable: true }, // Bonding Curve
        // Account 5
        { pubkey: associatedBondingCurve, isSigner: false, isWritable: true }, // Associated Bonding Curve
        // Account 6
        { pubkey: taDestination, isSigner: false, isWritable: true }, // TA Destination
        // Account 7
        { pubkey: payer.publicKey, isSigner: true, isWritable: true }, // Payer
        // Account 8
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // System Program
        // Account 9
        { pubkey: RAYDIUM_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        // Account 10
        { pubkey: RENT_PROGRAM_ID, isSigner: false, isWritable: false },
        // Account 11
        { pubkey: EVENT_AUTHORITY, isSigner: false, isWritable: false }, // Pump Fun Event Authority
        // Account 12
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // Pump Fun Token Program
    ]
  
    const data = Buffer.alloc(PumpFunBuyInstructionLayout.span)

    PumpFunBuyInstructionLayout.encode({
        instruction: PumpFunInstruction.Buy,
        tokenOut: tokenOut,
        maxSolCost: buyAmount
    }, data)
  
    return new TransactionInstruction({ keys, programId, data })
}

export function createPumpSellInstruction(
    tokenMint: PublicKey,
    bondingCurve: PublicKey,
    associatedBondingCurve: PublicKey,
    taDestination: PublicKey,
    payer: Keypair,
    minSolOut: bigint,
    amount: bigint,
    programId = TOKEN_PROGRAM_ID
  ): TransactionInstruction {
    const keys: AccountMeta[] = [
        // Account 1
        { pubkey: GLOBAL, isSigner: false, isWritable: false }, // Global
        // Account 2
        { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true }, // Pump Fun Fee Recipient
        // Account 3
        { pubkey: tokenMint, isSigner: false, isWritable: false }, // Token Mint
        // Account 4
        { pubkey: bondingCurve, isSigner: false, isWritable: true }, // Bonding Curve
        // Account 5
        { pubkey: associatedBondingCurve, isSigner: false, isWritable: true }, // Associated Bonding Curve
        // Account 6
        { pubkey: taDestination, isSigner: false, isWritable: true }, // TA Destination
        // Account 7
        { pubkey: payer.publicKey, isSigner: true, isWritable: true }, // Payer
        // Account 8
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // System Program
        // Account 9
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        // Account 10
        { pubkey: RAYDIUM_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        // Account 11
        { pubkey: EVENT_AUTHORITY, isSigner: false, isWritable: false }, // Pump Fun Account
        // Account 12
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // Pump Fun Token Program
    ]
  
    const data = Buffer.alloc(PumpFunSellInstructionLayout.span)

    PumpFunSellInstructionLayout.encode({
        instruction: PumpFunInstruction.Sell,
        amount: amount,
        minSolOutput: minSolOut
    }, data)
  
    return new TransactionInstruction({ keys, programId, data })
}

export const signAndConfirmTransaction = async (connection: Connection, keyPair: Keypair, instructions: TransactionInstruction[]) => {
    const latestBlockHash = await connection.getLatestBlockhash('confirmed')

    const messageV0 = new TransactionMessage({
        payerKey: keyPair.publicKey,
        recentBlockhash: latestBlockHash.blockhash,
        instructions: instructions
    }).compileToV0Message()

    const transaction = new VersionedTransaction(messageV0)

    transaction.sign([keyPair])

    const txId = await connection.sendTransaction(transaction, { maxRetries: 5 })

    const confirmation = await connection.confirmTransaction({
        signature: txId,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight
    })

    if (confirmation.value.err) {
        return [false, ""]
    }

    return [true, txId]
}