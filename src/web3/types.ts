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