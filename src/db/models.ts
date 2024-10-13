import { Schema, model } from "mongoose";
import { IToken, TokenModel } from "./types";

const TokenSchema = new Schema<IToken, TokenModel>({
    mint: String,
    name: String,
    symbol: String,
    description: String,
    image_uri: String,
    twitter: String,
    telegram: String,
    website: String,
    bondingCurve: String,
    associatedBondingCurve: String,
    creator: String,
    created_at: Number,
    raydium_pool: String,
    complete: Boolean,
    virtual_sol_reserves: String,
    virtual_token_reserves: String,
    real_sol_reserves: String,
    real_token_reserves: String,
    total_supply: String,
    market_cap_in_sol: String,
    market_cap_in_usd: String
})

export const Token = model<IToken, TokenModel>("Token", TokenSchema)