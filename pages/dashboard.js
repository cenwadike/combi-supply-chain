import Link from "next/link";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { useRouter } from "next/router";

import { supplyChainAddress } from "../config";
import SupplyChain from "../artifacts_/SupplyChain.json";

// dashboard should allow user add product to supply chain
// dashboard should allow user see for all products
// dashboard should display all ownerID products
export default function Dashboard() {
  const [userData, setUserData] = useState([]);
  // let userData = [];
  const [loading, setLoading] = useState("loading");
  const [upc, setUpc] = useState(null);
  const [buf1Data, setBuf1Data] = useState(null);
  const [buf2Data, setBuf2Data] = useState(null);
  const [buf3Data, setBuf3Data] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formInput, updateFormInput] = useState({
    farmerName: "",
    farmName: "",
    farmLatitude: "",
    farmLongitude: "",
    productMeta: "",
    price: "",
  });
  const router = useRouter();

  useEffect(() => {
    loadData().then(setLoading("loaded"));
  }, []);

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
    const items = await supplyChainContract.fetchMyItems();

    const data = await Promise.all(
      items.map(async (i) => {
        let price = ethers.utils.formatUnits(i.productPrice.toString(), "ether");

        let uData = {
          farmName: i.originFarmName,
          farmerName: i.originFarmMetadata,
          farmLatitude: i.originFarmLatitude,
          farmLongitude: i.originFarmLongitude,
          productMeta: i.productMetadata,
          price,
        };

        return uData;
      })
    );

    setUserData(data);

    // console.log(userData);
    // userData.map((data) => {
    //   console.log(data.farmName);
    //   console.log(data.farmLatitude);
    //   console.log(data.farmLongitude);
    //   console.log(data.productMeta);
    //   console.log(data.price);
    // });

    // async (_upc) => {
    //     let _buf1Data = await supplyChainContract.fetchItemBufferOne(_upc)
    //         .then(setBuf1Data(_buf1Data))
    //         .finally(console.log(buf1Data))
    //     let _buf2Data = await supplyChainContract.fetchItemBufferTwo(_upc)
    //         .then(setBuf2Data(_buf2Data))
    //     let _buf3Data = await supplyChainContract.fetchItemBufferThree(_upc)
    //         .then(setBuf3Data(_buf3Data))
    // }
  }

  // const listMyProducts = () =>

  ////////////////////////////////add item to chain
  async function addItemToChain() {
    const { farmerName, farmName, farmLatitude, farmLongitude, productMeta, price } = formInput;
    if (!farmerName && !farmName && !farmLatitude && !farmLongitude && !productMeta && !price)
      return;

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const supplyChainContract = new ethers.Contract(supplyChainAddress, SupplyChain.abi, signer);
    const productPrice = ethers.utils.parseUnits(formInput.price, "ether");

    supplyChainContract.harvestItem(
      farmerName,
      farmName,
      farmLatitude,
      farmLongitude,
      productMeta,
      productPrice
    );

    setShowModal(false);
    router.push("/dashboard");
  }

  if (loading == "loaded") {
    return (
      <div className='pt-12 text-2xl md:text-4xl text-blue-800 font-bold mb-12'>
        <div className='p-4'>
          <h2 className='text-2xl font-bold uppercase py-2'>Products</h2>
          <div className='flex flex-row sm:grid-cols-2 gap-4 pt-4'>
            {userData.map(
              ({ farmerName, farmName, farmLatitude, farmLongitude, productMeta, price }) => {
                return (
                  <div key={farmerName} className='border shadow rounded-xl overflow-hidden'>
                    <div className='p-4 bg-blue-800'>
                      <p className='text-2xl font-small text-white'>Farmer - {farmerName} </p>
                    </div>
                    <div className='p-4 bg-blue-800'>
                      <p className='text-2xl font-small text-white'>Farm - {farmName} </p>
                    </div>
                    <div className='p-4 bg-blue-800'>
                      <p className='text-2xl font-small text-white'>Latitude - {farmLatitude} </p>
                    </div>
                    <div className='p-4 bg-blue-800'>
                      <p className='text-2xl font-small text-white'>Longitude - {farmLongitude} </p>
                    </div>
                    <div className='p-4 bg-blue-800'>
                      <p className='text-2xl font-small text-white'>Product - {productMeta} </p>
                    </div>
                    <div className='p-4 bg-blue-800'>
                      <p className='text-2xl font-small text-white'>Price - {price} </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
          <Link href='/dashboard'>
            <a>
              <div className='flex justify-center m-5'>
                <button
                  className='text-white font-bold uppercase text-sm px-6 py-3 rounded shadow bg-blue-600 hover:bg-blue-900 hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                  type='button'
                  onClick={addItemToChain}>
                  add product
                </button>
              </div>
            </a>
          </Link>
        </div>
      </div>
    );
  } else {
    return (
      <>
        <div className='pt-12 px-5'>
          <h1 className='pt-8 text-3xl md:text-4xl text-indigo-600 font-small mb-2'>
            no product on this chain
          </h1>
        </div>
        <div className='mt-5 flex w-full justify-center'>
          <button
            className='bg-blue-900 text-white py-2 px-6 rounded-full text-xl mt-6 mb-6 hover:bg-blue-700 transition-colors duration-300'
            type='button'
            onClick={() => setShowModal(true)}>
            add product
          </button>
          {showModal ? (
            <>
              <div className='justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none'>
                <div className='relative w-auto my-6 mx-auto max-w-3xl'>
                  {/*content*/}
                  <div className='border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-blue-900 outline-none focus:outline-none'>
                    {/*header*/}
                    <div className='flex items-center justify-between p-5 border-b border-solid border-slate-200 rounded-t text-white'>
                      <h3 className='text-3xl font-semibold text-center uppercase pl-5'>
                        add product to supply chain
                      </h3>
                      <button
                        className='p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none'
                        onClick={() => setShowModal(false)}>
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
                            <div className='md:w-1/3'>
                              <label
                                className='block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4'
                                htmlFor='inline-full-name'>
                                Farmer
                              </label>
                            </div>
                            <div className='md:w-2/3'>
                              <input
                                className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500'
                                id='farmer_name'
                                type='text'
                                placeholder='Musa John'
                                onChange={(e) =>
                                  updateFormInput({ ...formInput, farmerName: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <div className='md:flex md:items-center mb-6'>
                            <div className='md:w-1/3'>
                              <label
                                className='block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4'
                                htmlFor='inline-full-name'>
                                Farm
                              </label>
                            </div>
                            <div className='md:w-2/3'>
                              <input
                                className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500'
                                id='farm_name'
                                type='text'
                                placeholder='MJ Farm'
                                onChange={(e) =>
                                  updateFormInput({ ...formInput, farmName: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <div className='md:flex md:items-center mb-6'>
                            <div className='md:w-1/3'>
                              <label
                                className='block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4'
                                htmlFor='inline-full-name'>
                                Latitude
                              </label>
                            </div>
                            <div className='md:w-2/3'>
                              <input
                                className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500'
                                id='farm_latitude'
                                type='text'
                                placeholder='7.611038'
                                onChange={(e) =>
                                  updateFormInput({ ...formInput, farmLatitude: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <div className='md:flex md:items-center mb-6'>
                            <div className='md:w-1/3'>
                              <label
                                className='block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4'
                                htmlFor='inline-full-name'>
                                Longitude
                              </label>
                            </div>
                            <div className='md:w-2/3'>
                              <input
                                className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500'
                                id='farm_longitude'
                                type='text'
                                placeholder='5.257116'
                                onChange={(e) =>
                                  updateFormInput({ ...formInput, farmLongitude: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <div className='md:flex md:items-center mb-6'>
                            <div className='md:w-1/3'>
                              <label
                                className='block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4'
                                htmlFor='inline-full-name'>
                                Product
                              </label>
                            </div>
                            <div className='md:w-2/3'>
                              <input
                                className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500'
                                id='product_data'
                                type='text'
                                placeholder='10 pages of onions'
                                onChange={(e) =>
                                  updateFormInput({ ...formInput, productMeta: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <div className='md:flex md:items-center mb-6'>
                            <div className='md:w-1/3'>
                              <label
                                className='block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4'
                                htmlFor='farmers_price'>
                                Price(ETH)
                              </label>
                            </div>
                            <div className='md:w-2/3'>
                              <input
                                className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500'
                                id='price'
                                type='number'
                                placeholder='2'
                                onChange={(e) =>
                                  updateFormInput({ ...formInput, price: e.target.value })
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
                        onClick={() => setShowModal(false)}>
                        Close
                      </button>
                      <Link href='/dashboard'>
                        <a>
                          <button
                            className='bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                            type='button'
                            onClick={addItemToChain}>
                            add product
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
      </>
    );
  }
}
