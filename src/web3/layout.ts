import { struct, u8 } from '@solana/buffer-layout';
import { publicKey, u64 } from '@solana/buffer-layout-utils';
import { PumpFunBuyInstructionData, PumpFunSellInstructionData } from './types';

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