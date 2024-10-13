import { Model } from "mongoose";

export interface IToken {
    mint: string,
    name: string,
    symbol: string,
    description: string,
    image_uri: string,
    twitter: string,
    telegram: string,
    website: string,
    bondingCurve: string,
    associatedBondingCurve: string,
    creator: string,
    created_at: number,
    raydium_pool: string,
    complete: boolean,
    virtual_sol_reserves: string,
    virtual_token_reserves: string,
    real_sol_reserves: string,
    real_token_reserves: string,
    total_supply: string,
    market_cap_in_sol: string,
    market_cap_in_usd: string
}

export type TokenModel = Model<IToken>