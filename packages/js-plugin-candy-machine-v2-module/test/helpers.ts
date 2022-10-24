import { Buffer } from 'buffer';
import { sha512 } from '@noble/hashes/sha512';
import { Metaplex, sol, toBigNumber } from '@metaplex-foundation/js-core';
import {
  candyMachineV2Module,
  CandyMachineV2Item,
  CreateCandyMachineV2Input,
} from '../src';

import {
  amman,
  metaplex as metaplexBase,
  MetaplexTestOptions,
} from '../../js-core/test/helpers';
export * from '../../js-core/test/helpers';

export const metaplex = async (options: MetaplexTestOptions = {}) => {
  return (await metaplexBase(options)).use(candyMachineV2Module());
};

export async function createCandyMachineV2(
  mx: Metaplex,
  input: Partial<CreateCandyMachineV2Input> & {
    items?: CandyMachineV2Item[];
  } = {}
) {
  const candyMachineOutput = await mx.candyMachinesV2().create({
    price: sol(1),
    sellerFeeBasisPoints: 500,
    itemsAvailable: toBigNumber(100),
    ...input,
  });

  let { candyMachine } = candyMachineOutput;
  const { response } = candyMachineOutput;

  if (input.items) {
    await mx.candyMachinesV2().insertItems({
      candyMachine,
      authority: mx.identity(),
      items: input.items,
    });

    candyMachine = await mx.candyMachinesV2().refresh(candyMachine);
  }

  await amman.addr.addLabel('candy-machine', candyMachine.address);
  await amman.addr.addLabel('tx: create candy-machine', response.signature);

  return {
    response,
    candyMachine,
  };
}

export function create32BitsHash(
  input: Buffer | string,
  slice?: number
): number[] {
  const hash = create32BitsHashString(input, slice);

  return Buffer.from(hash, 'utf8').toJSON().data;
}

export function create32BitsHashString(
  input: Buffer | string,
  slice = 32
): string {
  const hash = sha512(input).slice(0, slice / 2);

  return Buffer.from(hash).toString('hex');
}
