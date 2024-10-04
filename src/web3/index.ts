import { Metaplex } from "@metaplex-foundation/js";
import { getConnection } from "./utils";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import { createPumpBuyInstruction, getAccountData, getBondingCurve } from "./config";

// export const buy = async (mint: PublicKey, buyAmount: bigint, tokenOut: bigint,) => {
//     const { bondingCurve, associatedBondingCurve } = await getBondingCurve(mint)
//     const tx = await createPumpBuyInstruction(
//         mint,
//         bondingCurve,
//         associatedBondingCurve,
//         buyAmount,
//         tokenOut
//     )
// }

export const sell = () => {

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