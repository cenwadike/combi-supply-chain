#!/bin/bash
export PATH=$PATH:/home/ce/

# run deploy.js script
echo "deploying to $1..."
npx hardhat run scripts/deploy.js --network $1

rm -rf ../artifacts_
mkdir ../artifacts_
cp -r artifacts/contracts/base/SupplyChain.sol artifacts_
