#!/bin/bash
export PATH=$PATH:/home/ce/

# run deploy.js script
echo "deploying to $1..."
npx hardhat run scripts/deploy.js --network $1

cp artifacts/contracts/base/SupplyChain.sol/SupplyChain.json target/SupplyChain.json
