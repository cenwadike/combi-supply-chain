const hre = require("hardhat")
const fs = require('fs');

async function main() {
  await hre.run('compile')

  // const [deployer] = await ethers.getSigners()

  // console.log("Deploying contracts with the account:", deployer.address)

  // console.log("Account balance:", (await deployer.getBalance()).toString())

  // We get the contract to deploy
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain")
  const supplyChain = await SupplyChain.deploy()
  await supplyChain.deployed()
  console.log("SupplyChain deployed to:", supplyChain.address)

  let config = `
  export const supplyChainAddress = "${supplyChain.address}"
  `
  let data = JSON.stringify(config)
  fs.writeFileSync('config.js', JSON.parse(data))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
