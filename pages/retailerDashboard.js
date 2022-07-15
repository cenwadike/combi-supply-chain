import Link from "next/link";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { useState, useEffect } from "react";

import { supplyChainAddress } from "../config";
import SupplyChain from "../artifacts_/SupplyChain.json";

// dashboard should display all of retailer products
export default function Dashboard() {
  const [userItems, setUserItems] = useState([]);
  const [userAvailableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState("loading");

  useEffect(() => {
    loadData().then(setLoading("loaded"));
  }, []);

  //////////////////////////////////load data from blockchain
  async function loadData() {
    let web3Modal;
    try {
      web3Modal = new Web3Modal();
    } catch (error) {
      console.log("User rejected transaction");
    }
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const supplyChainContract = new ethers.Contract(supplyChainAddress, SupplyChain.abi, signer);
    const myItems = await supplyChainContract.fetchRetailerItems();
    const availaibleItems = await supplyChainContract.fetchAvailableItemsForRetailer();

    const myItemsData = await Promise.all(
      myItems.map(async (i) => {
        let price = ethers.utils.formatUnits(i.productPrice.toString(), "ether");
        let sku = ethers.utils.formatUnits(i.sku, 0);
        let upc = ethers.utils.formatUnits(i.upc, 0);

        let state = 3;
        switch (i.itemState) {
          case 3:
            state = "for sale";
            break;
          case 4:
            state = "sold";
            break;
          case 5:
            state = "shipped";
            break;
          case 6:
            state = "recieved";
            break;
          case 7:
            state = "purchased";
            break;
          default:
            state = "harvested";
        }

        let uData = {
          farm: i.originFarmMetadata,
          sku: sku,
          upc: upc,
          owner: i.owner,
          retailerId: i.retailerID,
          price: price,
          state: state,
        };

        return uData;
      })
    );

    setUserItems(myItemsData);
    console.log("users", myItemsData);

    const myAvailableItems = await Promise.all(
      availaibleItems.map(async (i) => {
        let price = ethers.utils.formatUnits(i.productPrice.toString(), "ether");
        let sku = ethers.utils.formatUnits(i.sku, 0);
        let upc = ethers.utils.formatUnits(i.upc, 0);

        let state = 3;
        switch (i.itemState) {
          case 3:
            state = "for sale";
            break;
          case 4:
            state = "sold";
            break;
          case 5:
            state = "shipped";
            break;
          case 6:
            state = "recieved";
            break;
          case 7:
            state = "purchased";
            break;
          default:
            state = "harvested";
        }

        let uData = {
          farm: i.originFarmMetadata,
          sku: sku,
          upc: upc,
          owner: i.owner,
          farmerId: i.originFarmerID,
          distroId: i.distributorID,
          price: price,
          state: state,
          data: i.productMetadata,
        };

        return uData;
      })
    );

    setAvailableItems(myAvailableItems);
  }

  //////////////////////////////////display products
  if (loading == "loaded") {
    return (
      <>
        <div className='pt-12 text-2xl md:text-4xl text-blue-800 font-bold mb-12'>
          <div className='p-4'>
            <h2 className='text-2xl font-bold uppercase py-2'>My Products</h2>
            <div className='grid justify-items-stretch sm:grid-cols-2 gap-4 pt-4'>
              {userItems.map(({ farm, retailerId, sku, upc, price, state }) => {
                return (
                  <div key={sku} className='border shadow rounded-xl overflow-hidden'>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>FARM - {farm}</p>
                    </div>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>SKU - {sku}</p>
                    </div>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>UPC - {upc}</p>
                    </div>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>PRICE - {price}</p>
                    </div>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>STATE - {state}</p>
                    </div>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>RETAIL_ID - {retailerId}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className='pt-12 text-2xl md:text-4xl text-blue-800 font-bold mb-12'>
          <div className='p-4'>
            <h2 className='text-2xl font-bold uppercase py-2'>My Products</h2>
            <div className='grid justify-items-stretch sm:grid-cols-2 gap-4 pt-4'>
              {userAvailableItems.map(({ farm, data, farmerId, distroId, sku, upc, price }) => {
                return (
                  <div key={sku} className='border shadow rounded-xl overflow-hidden'>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>FARM - {farm}</p>
                    </div>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>PRODUCT - {data}</p>
                    </div>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>SKU - {sku}</p>
                    </div>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>UPC - {upc}</p>
                    </div>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>PRICE - {price}</p>
                    </div>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>FARMER_ID - {farmerId}</p>
                    </div>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>DISTRO_ID - {distroId}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }
}
