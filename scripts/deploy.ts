import { ethers } from 'hardhat';

import { IERC20__factory } from '../typechain-types';

async function main() {
  await IERC20__factory.connect(
    '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7',
    (
      await ethers.getSigners()
    )[0],
  )
    .approve(
      '0x0226a11D2973c31C64C856aeCaCF23EcE93e43b7',
      '20000000000000000000',
    )
    .then((tx) => tx.wait());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
