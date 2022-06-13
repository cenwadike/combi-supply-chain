import Link from 'next/link'
import { ethers } from "ethers"
import { createPopper } from "@popperjs/core"
import { useState, useEffect, createRef } from 'react'

export default function Navbar() {
    ////////////////////////////////metamask state
    const [userAccount, setUserAccount] = useState(null)
    const [userBalance, setUserBalance] = useState(null)
    const [chainName, setChainName] = useState(null)
    const [chainId, setChainId] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [connectButtonText, setConnectButtonText] = useState("Connect Wallet")

    ////////////////////////////////metamask state handlers
    const connectWalletHandler = () => {
        MetaMaskClientCheck()
    }

    const isMetaMaskInstalled = () => {
        const { ethereum } = window
        return Boolean(ethereum && ethereum.isMetaMask)
    }

    const MetaMaskClientCheck = () => {
        if (!isMetaMaskInstalled()) {
            return (
                <button onClick={onClickInstallMetamask}> click here to install MetaMask</button>
            )
        } else {
            onClickConnectMetamask()
        }
    }

    const onClickInstallMetamask = () => {
        return
    }

    const onClickConnectMetamask = async () => {
        try {
            await ethereum.request({ method: 'eth_requestAccounts' })
            const result = await ethereum.request({ method: 'eth_accounts' })
            accountChangeHandler(result[0])
            getAccountBalance(result[0])
        } catch (error) {
            setErrorMessage(error.message)
            console.error(error)
        } finally {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            provider.getNetwork().then((result) => {
                setChainId(result.chainId)
                setChainName(result.name)
            })
        }
    }

    const getAccountBalance = async (account) => {
        await ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] })
            .then(balance => {
                setUserBalance(ethers.utils.formatEther(balance))
            })
            .catch(error => {
                setErrorMessage(error.message)
            })
    }

    const accountChangeHandler = (newAccount) => {
        setUserAccount(newAccount)
        setConnectButtonText(newAccount)
        getAccountBalance(newAccount.toString())
    }

    const chainChangedHandler = () => {
        // reload the page to avoid any errors with chain change mid use of application
        window.location.reload()
    }

    // listen for account changes
    useEffect(() => {
        const { ethereum } = window
        ethereum.on('chainChanged', () => {
            chainChangedHandler()
        })
        ethereum.on('accountsChanged', () => {
            accountChangeHandler
        })
    })

    ////////////////////////////////hamburger state
    const [active, setActive] = useState(false)

    ////////////////////////////////hamburger state handler
    const handleClick = () => {
        setActive(!active)
    }

    ////////////////////////////////dropdown state
    const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false)
    const [roleButtonText, setRoleButtonText] = useState("Role")
    const btnDropdownRef = createRef()
    const popoverDropdownRef = createRef()

    ////////////////////////////////dropdown state handler
    const openDropdownPopover = () => {
        createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
            placement: "bottom-start"
        })
        setDropdownPopoverShow(true)
    }
    const closeDropdownPopover = () => {
        setDropdownPopoverShow(false)
    }

    return (
        <>
            <nav className='fixed w-full flex items-center flex-wrap bg-white px-2 py-2 navbar-expand-lg shadow-md'>
                <a className='inline-flex items-center p-2 mr-0'>
                    <span className='text-xl text-blue-700 hover:text-indigo-800 font-bold uppercase tracking-wide'>
                        AgroTrace
                    </span>
                </a>
                <button
                    className=' inline-flex p-3 hover:bg-indigo-600 rounded lg:hidden text-indigo-600 ml-auto hover:text-white outline-none'
                    onClick={handleClick}
                >
                    <i className="fas fa-bars"></i>
                </button>
                {/*Note that in this div we will use a ternary operator to decide whether or not to display the content of the div  */}
                <div
                    className={`${active ? '' : 'hidden'
                        }   w-full lg:inline-flex lg:flex-grow lg:w-auto`}
                >
                    <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col lg:h-auto'>
                        <Link href='/dashboard'>
                            <a className="p-2 lg:px-4 md:mx-2 text-blue-700 text-center border border-transparent rounded hover:bg-indigo-300 hover:text-indigo-800 transition-colors duration-300">Dashboard</a>
                        </Link>
                        <button className="p-2 lg:px-4 md:mx-2 text-blue-700 text-center border border-transparent rounded hover:bg-indigo-300 hover:text-indigo-800 transition-colors duration-300 inline-flex items-center" type="button" data-dropdown-toggle="dropdown"
                            ref={btnDropdownRef}
                            onClick={() => {
                                dropdownPopoverShow
                                    ? closeDropdownPopover()
                                    : openDropdownPopover()
                            }}
                        >{roleButtonText}<svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button>
                        <div
                            ref={popoverDropdownRef}
                            className={dropdownPopoverShow ? "block " : "hidden " +
                                "text-base z-50 float-left py-2 list-none text-left shadow-lg mt-1"
                            }
                            style={{ minWidth: "12rem" }}
                        >
                            <Link href="/dashboard">
                                <a
                                    className={
                                        "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap text-white hover:text-indigo-300 bg-blue-900 border-0"
                                    }
                                    onClick={() => setRoleButtonText("Farmer")}
                                >
                                    farmer
                                </a>
                            </Link>
                            <Link href="/dashboard">
                                <a
                                    className={
                                        "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap text-white hover:text-indigo-300 bg-blue-900 border-0"
                                    }
                                    onClick={() => setRoleButtonText("Distributor")}
                                >
                                    distributor
                                </a>
                            </Link>
                            <Link href="/dashboard">
                                <a
                                    className={
                                        "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap text-white hover:text-indigo-300 bg-blue-900 border-0" +
                                        "text-white"
                                    }
                                    onClick={() => setRoleButtonText("Retailer")}
                                >
                                    retailer
                                </a>
                            </Link>
                            <Link href="/dashboard">
                                <a
                                    className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap text-white hover:text-indigo-300 bg-blue-900 border-0"
                                    onClick={() => setRoleButtonText("Consumer")}
                                >
                                    consumer
                                </a>
                            </Link>
                        </div>
                        {/* <Link href='/about'>
                            <a className="p-2 lg:px-4 md:mx-2 text-blue-700 text-center border border-transparent rounded hover:bg-indigo-300 hover:text-indigo-800 transition-colors duration-300">About</a>
                        </Link> */}
                        <Link href='/dashboard'>
                            <button onClick={connectWalletHandler} className="p-2 lg:px-4 md:mx-2 bg-indigo-300 text-blue-700 text-center border border-transparent rounded hover:bg-indigo-900 hover:text-indigo-700 transition-colors duration-300">{connectButtonText}</button>
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    )
} 
