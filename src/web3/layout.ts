import { struct, u8 } from '@solana/buffer-layout';
import { publicKey, u64, bool } from '@solana/buffer-layout-utils';
import { BondingCurve, PumpFunBuyInstructionData, PumpFunSellInstructionData } from './types';

export const PumpFunBuyInstructionLayout = struct<PumpFunBuyInstructionData>([
    u64('instruction'),
    u64('tokenOut'),
    u64('maxSolCost')
])

export const PumpFunSellInstructionLayout = struct<PumpFunSellInstructionData>([
    u64('instruction'),
    u64('amount'),
    u64('minSolOutput')
])

export const BondingCurveLayout = struct<BondingCurve>([
    u64('virtualTokenReserves'),
    u64('virtualSolReserves'),
    u64('realTokenReserves'),
    u64('realSolReserves'),
    u64('tokenTotalSupply'),
    bool('complete')
])