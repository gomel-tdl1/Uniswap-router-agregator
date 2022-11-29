import {
  loadFixture,
  impersonateAccount,
} from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

import {
  BAKERY_ROUTER_TESTNET,
  routersTestnet,
} from '../config/constants/routers';
// eslint-disable-next-line camelcase
import {
  IERC20__factory,
  UniswapRouterAgregator__factory,
} from '../typechain-types';

describe('Aggregator', () => {
  async function deployAggregatorFixture() {
    await impersonateAccount('0x352a7a5277ec7619500b06fa051974621c1acd12');
    const holder = await ethers.getSigner(
      '0x352a7a5277ec7619500b06fa051974621c1acd12',
    );
    const aggregator = await new UniswapRouterAgregator__factory(holder).deploy(
      routersTestnet,
    );
    await aggregator.deployed();
    const addressBusd = '0x78867bbeef44f2326bf8ddd1941a4439382ef2a7';
    const holderAddress = '0x352a7a5277ec7619500b06fa051974621c1acd12';
    const addressWbnb = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
    // 0x78867bbeef44f2326bf8ddd1941a4439382ef2a7 busd
    // 0x352a7a5277ec7619500b06fa051974621c1acd12 holder

    // 0xae13d989dac2f0debff460ac112a837c89baa7cd wbnb
    // 0x352a7a5277ec7619500b06fa051974621c1acd12
    return { aggregator, holder, addressBusd, holderAddress, addressWbnb };
  }

  it('get quote', async () => {
    const { aggregator, addressBusd, addressWbnb } = await loadFixture(
      deployAggregatorFixture,
    );
    const amountIn = ethers.utils.parseUnits('300');

    const routers = await aggregator.routers(0);
    console.log(routers);

    const quoteData = await aggregator.quote(
      amountIn,
      addressBusd,
      addressWbnb,
    );
    expect(quoteData.amountOut.eq(BigNumber.from('0x362b968156f3113a'))).eq(
      true,
    );
    expect(quoteData.router).eq(BAKERY_ROUTER_TESTNET);
    expect(quoteData.path.map((e) => e.toLowerCase())).deep.equal(
      [addressBusd, addressWbnb].map((e) => e.toLowerCase()),
    );
  });
  it('swap', async () => {
    const { aggregator, addressBusd, addressWbnb, holder } = await loadFixture(
      deployAggregatorFixture,
    );
    const amountIn = ethers.utils.parseUnits('300');

    const routers = await aggregator.routers(0);
    console.log(routers);

    const quoteData = await aggregator.quote(
      amountIn,
      addressBusd,
      addressWbnb,
    );
    console.log('quote data: ', quoteData);

    await IERC20__factory.connect(addressBusd, holder)
      .approve(aggregator.address, amountIn)
      .then((tx) => tx.wait());

    await aggregator
      .swap(amountIn, quoteData.amountOut, quoteData.router, [
        addressBusd,
        addressWbnb,
      ])
      .then((tx) => tx.wait());
  });
});
