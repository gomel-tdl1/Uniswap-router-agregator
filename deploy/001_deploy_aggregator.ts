import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { routersTestnet } from '../config/constants/routers';
import { verify } from '../helpers/verify';

const CONTRACT_NAME = 'UniswapRouterAgregator';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const result = await deploy(CONTRACT_NAME, {
    from: deployer,
    args: [routersTestnet],
    log: true,
    autoMine: true,
  });

  if (result.newlyDeployed && result.transactionHash) {
    await verify(
      hre,
      result.address,
      result.transactionHash,
      result.args ?? [],
    );
  }
};
func.tags = [CONTRACT_NAME];
func.id = CONTRACT_NAME;

export default func;
