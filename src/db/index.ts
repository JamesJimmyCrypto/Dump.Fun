import { Token } from "./models";
import { calculate_mcap_in_sol_from_bonding_curve, calculate_mcap_in_usd_from_bonding_curve, getBondingCurve, getBondingCurveData } from "../web3/config";
import { getTokenInfo } from "../web3/index";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getConnection } from "../web3/utils";

export const createToken = async (mint: string) => {
    try {
        const connection = getConnection()

        const { bondingCurve, associatedBondingCurve } = await getBondingCurve(new PublicKey(mint))

        const { 
            name,
            symbol,
            decimals,
            description,
            image_uri,
        } = await getTokenInfo(new PublicKey(mint))

        const bondingCurveData = await getBondingCurveData(connection, bondingCurve)

        const mcap_in_sol = await calculate_mcap_in_sol_from_bonding_curve(connection, bondingCurve, decimals!)
        const mcap_in_usd = await calculate_mcap_in_usd_from_bonding_curve(connection, bondingCurve, decimals!)

        const token = new Token({
            mint,
            name,
            symbol,
            description,
            image_uri,
            twitter: "",
            telegram: "",
            website: "",
            bondingCurve: bondingCurve.toString(),
            associatedBondingCurve: associatedBondingCurve.toString(),
            creator: "",
            created_at: 0,
            raydium_pool: "",
            complete: bondingCurveData.complete,
            virtual_sol_reserves: (Number(bondingCurveData.virtualSolReserves) / LAMPORTS_PER_SOL).toLocaleString(),
            virtual_token_reserves: (Number(bondingCurveData.virtualTokenReserves) / (10**decimals!)).toLocaleString(),
            real_sol_reserves: (Number(bondingCurveData.realSolReserves) / LAMPORTS_PER_SOL).toLocaleString(),
            real_token_reserves: (Number(bondingCurveData.realTokenReserves) / (10**decimals!)).toLocaleString(),
            total_supply: (Number(bondingCurveData.tokenTotalSupply) / (10**decimals!)).toLocaleString(),
            market_cap_in_sol: mcap_in_sol.toLocaleString(),
            market_cap_in_usd: mcap_in_usd.toLocaleString()
        })
        const data = token.save()

        return data
    } catch (error) {
        console.log(error)   
    }
}

export const getToken = async (mint: string) => {
    try {
        const token = await Token.findOne({ mint })

        return token
    } catch (error) {
        console.log(error)
    }
}

export const updateToken = async (mint: string) => {
    try {
        const connection = getConnection()
        const { decimals} = await getTokenInfo(new PublicKey(mint))

        const { bondingCurve } = await getBondingCurve(new PublicKey(mint))
        const bondingCurveData = await getBondingCurveData(connection, bondingCurve)

        const mcap_in_sol = await calculate_mcap_in_sol_from_bonding_curve(connection, bondingCurve, decimals!)
        const mcap_in_usd = await calculate_mcap_in_usd_from_bonding_curve(connection, bondingCurve, decimals!)

        const token = await Token.findOneAndUpdate(
            { mint },
            { $set: { 
                complete: bondingCurveData.complete,
                virtual_sol_reserves: (Number(bondingCurveData.virtualSolReserves) / LAMPORTS_PER_SOL).toLocaleString(),
                virtual_token_reserves: (Number(bondingCurveData.virtualTokenReserves) / (10**decimals!)).toLocaleString(),
                real_sol_reserves: (Number(bondingCurveData.realSolReserves) / LAMPORTS_PER_SOL).toLocaleString(),
                real_token_reserves: (Number(bondingCurveData.realTokenReserves) / (10**decimals!)).toLocaleString(),
                total_supply: (Number(bondingCurveData.tokenTotalSupply) / (10**decimals!)).toLocaleString(),
                market_cap_in_sol: mcap_in_sol.toLocaleString(),
                market_cap_in_usd: mcap_in_usd.toLocaleString()
            }}
        )

        return token
    } catch (error) {
        console.log(error)
    }
}

export const deleteToken = async (mint: string) => {
    try {
        const token = await Token.deleteOne({ mint })

        return token
    } catch (error) {
        console.log(error)
    }
}