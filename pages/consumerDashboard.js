import Link from "next/link";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { supplyChainAddress } from "../config";
import SupplyChain from "../artifacts_/SupplyChain.json";

// dashboard should display all of distributor products
// allow distributor buy available products
export default function Dashboard() {
  const [userItems, setUserItems] = useState([]);
  const [userAvailableItems, setAvailableItems] = useState([]);
  const [buyModal, setModal] = useState(false);
  const [buyInput, updateBuyInput] = useState({ upc: "", newPrice: "" });
  const [loading, setLoading] = useState("loading");

  const router = useRouter();

  useEffect(() => {
    loadData().then(setLoading("loaded"));
  }, []);

  //////////////////////////////////load data from blockchain
  async function loadData() {
    let web3Modal;
    try {
      web3Modal = new Web3Modal();
    } catch (error) {
      console.log("User rejected, input wallet password");
    }
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const supplyChainContract = new ethers.Contract(supplyChainAddress, SupplyChain.abi, signer);
    let myItems = [];
    let availaibleItems = [];
    try {
      myItems = await supplyChainContract.fetchConsumerItems();
      availaibleItems = await supplyChainContract.fetchAvailableItemsForConsumer();
      console.log(availaibleItems);
    } catch (error) {}

    const myItemsData = await Promise.all(
      myItems.map(async (i) => {
        let price = ethers.utils.formatUnits(i.productPrice.toString(), "ether");
        let sku = ethers.utils.formatUnits(i.sku, 0);
        let upc = ethers.utils.formatUnits(i.upc, 0);

        let state = 3;
        switch (i.itemState) {
          case 1:
            state = "On Farmer Sale";
            break;
          case 2:
            state = "On Whole Sale";
            break;
          case 5:
            state = "On Retail Sale";
            break;
          case 7:
            state = "With Consumer";
            break;
          default:
            state = "NaN";
        }

        let uData = {
          farm: i.originFarmMetadata,
          sku: sku,
          upc: upc,
          owner: i.owner,
          consumerId: i.consumerID,
          price: price,
          state: state,
          data: i.productMetadata,
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
          case 1:
            state = "On Farmer Sale";
            break;
          case 2:
            state = "On Whole Sale";
            break;
          case 5:
            state = "On Retail Sale";
            break;
          case 7:
            state = "With Consumer";
            break;
          default:
            state = "NaN";
        }

        let uData = {
          farm: i.originFarmMetadata,
          sku: sku,
          upc: upc,
          owner: i.owner,
          retailerId: i.retailerID,
          price: price,
          state: state,
          data: i.productMetadata,
        };

        return uData;
      })
    );

    setAvailableItems(myAvailableItems);
    console.log("available:", myAvailableItems);
  }

  //////////////////////////////////sell item to next buyer in supplychain
  async function changeOwner(buyInput) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const supplyChainContract = new ethers.Contract(supplyChainAddress, SupplyChain.abi, signer);
    const { upc, newPrice } = buyInput;

    try {
      const currentPrice = await supplyChainContract.fetchCurrentPrice(upc);
      supplyChainContract.buyAsRetail(upc, newPrice, { value: currentPrice });
    } catch (error) {
      console.log(error);
    }

    setModal(false);
    router.push("/consumerDashboard");
  }

  //////////////////////////////////display products
  if (loading == "loaded") {
    return (
      <>
        <div className='pt-12 text-2xl md:text-4xl text-blue-800 font-bold mb-12'>
          <div className='p-4'>
            <h2 className='text-2xl font-bold uppercase py-2'>My Products</h2>
            <div className='grid justify-items-stretch sm:grid-cols-2 gap-4 pt-4'>
              {userItems.map(({ farm, data, consumerId, sku, upc, price, state }) => {
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
                      <p className='text-xl font-small text-white'>STATE - {state}</p>
                    </div>
                    <div className='p-4 flex justify-center bg-blue-800 border-t border-solid border-slate-200'>
                      <p className='text-xl font-small text-white'>CONSUMER - {consumerId}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className='pt-12 text-2xl md:text-4xl text-blue-800 font-bold mb-12'>
          <div className='p-4'>
            <h2 className='text-2xl font-bold uppercase py-2'>Available Products </h2>
            <div className='grid justify-items-stretch sm:grid-cols-2 gap-4 pt-4'>
              {userAvailableItems.map(({ farm, data, retailerId, sku, upc, price }) => {
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
                      <p className='text-xl font-small text-white'>RETAIL - {retailerId}</p>
                    </div>
                    <div className='flex justify-center p-2 bg-blue-800 border-t border-solid border-slate-200 rounded-b'>
                      <button
                        className='bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                        type='button'
                        onClick={() => setModal(true)}>
                        buy product
                      </button>
                      {buyModal ? (
                        <>
                          <div className='justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none'>
                            <div className='relative w-auto my-6 mx-auto max-w-3xl'>
                              {/*content*/}
                              <div className='border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-blue-900 outline-none focus:outline-none'>
                                {/*header*/}
                                <div className='flex items-center justify-flex p-5 border-b border-solid border-slate-200 rounded-t text-white'>
                                  <h3 className='text-3xl font-semibold text-center uppercase pl-5'>
                                    buy and update price
                                  </h3>
                                  <button
                                    className='p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none'
                                    onClick={() => setModal(false)}>
                                    <span className='bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none'>
                                      ×
                                    </span>
                                  </button>
                                </div>
                                {/*body*/}
                                <div className='relative p-6 pb-0 flex-auto'>
                                  <div className='px-4 flex justify-center'>
                                    <form className='w-full max-w-sm'>
                                      <div className='md:flex md:items-center mb-6'>
                                        <div className='md:w-2/3'>
                                          <label
                                            className='block text-white font-bold uppercase text-xl md:text-right mb-1 md:mb-0 pr-4'
                                            htmlFor='inline-full-name'>
                                            new price
                                          </label>
                                        </div>
                                        <div className='md:w-3/5'>
                                          <input
                                            className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full text-gray-700 focus:outline-none focus:bg-white focus:border-blue-600'
                                            id='new_price'
                                            type='number'
                                            placeholder='0.01'
                                            onChange={(e) =>
                                              updateBuyInput({
                                                ...buyInput,
                                                upc: { upc },
                                                newPrice: ethers.utils.parseEther(
                                                  e.target.value.toString()
                                                ),
                                              })
                                            }
                                          />
                                        </div>
                                        <div className='md:w-2/3'>
                                          <label
                                            className='block text-white font-bold uppercase text-xl md:text-right mb-1 md:mb-0 pr-4'
                                            htmlFor='inline-full-name'>
                                            upc
                                          </label>
                                        </div>
                                        <div className='md:w-3/5'>
                                          <input
                                            className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full text-gray-700 focus:outline-none focus:bg-white focus:border-blue-600'
                                            id='upc'
                                            type='number'
                                            placeholder='1'
                                            onChange={(e) =>
                                              updateBuyInput({
                                                ...buyInput,
                                                upc: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                                {/*footer*/}
                                <div className='flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b'>
                                  <button
                                    className='text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                                    type='button'
                                    onClick={() => setModal(false)}>
                                    Close
                                  </button>
                                  <Link href='/dashboard'>
                                    <a>
                                      <button
                                        className='bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                                        type='button'
                                        onClick={() => {
                                          try {
                                            changeOwner(buyInput);
                                          } catch (error) {
                                            console.log(error);
                                          }
                                        }}>
                                        buy product
                                      </button>
                                    </a>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className='opacity-25 fixed inset-0 z-40 bg-black'></div>
                        </>
                      ) : null}
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
