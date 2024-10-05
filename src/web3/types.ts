export interface PumpFunBuyInstructionData {
    instruction: bigint,
    tokenOut: bigint,
    maxSolCost: bigint
}

export interface PumpFunSellInstructionData {
    instruction: bigint,
    amount: bigint,
    minSolOutput: bigint
}

export interface BondingCurve {
    virtualTokenReserves: bigint,
    virtualSolReserves: bigint,
    realTokenReserves: bigint,
    realSolReserves: bigint,
    tokenTotalSupply: bigint,
    complete: boolean
}