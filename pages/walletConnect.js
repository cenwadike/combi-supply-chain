// import { useState, useEffect } from "react"
// import { ethers } from "ethers"
// import Link from 'next/link'


// const WalletConnect = () => {

//     const [userAccount, setUserAccount] = useState(null)
//     const [userBalance, setUserBalance] = useState(null)
//     const [chainName, setChainName] = useState(null)
//     const [chainId, setChainId] = useState(null)
//     const [errorMessage, setErrorMessage] = useState(null)
//     const [connectButtonText, setConnectButtonText] = useState("Connect Wallet")

//     const connectWalletHandler = () => {
//         MetaMaskClientCheck()
//     }

//     const isMetaMaskInstalled = () => {
//         const { ethereum } = window;
//         return Boolean(ethereum && ethereum.isMetaMask);
//     };

//     const MetaMaskClientCheck = () => {
//         if (!isMetaMaskInstalled()) {
//             return (
//                 <button onClick={onClickInstallMetamask}> click here to install MetaMask</button>
//             )
//         } else {
//             onClickConnectMetamask()
//         }
//     };

//     const onClickInstallMetamask = () => {
//         return
//     }

//     const onClickConnectMetamask = async () => {
//         try {
//             await ethereum.request({ method: 'eth_requestAccounts' });
//             const result = await ethereum.request({ method: 'eth_accounts' })
//             accountChangeHandler(result[0])
//             getAccountBalance(result[0])
//         } catch (error) {
//             setErrorMessage(error.message);
//             console.error(error);
//         } finally {
//             const provider = new ethers.providers.Web3Provider(window.ethereum)
//             provider.getNetwork().then((result) => {
//                 setChainId(result.chainId)
//                 setChainName(result.name)
//             })
//         }
//     }

//     const getAccountBalance = async (account) => {
//         await ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] })
//             .then(balance => {
//                 setUserBalance(ethers.utils.formatEther(balance));
//             })
//             .catch(error => {
//                 setErrorMessage(error.message);
//             });
//     }

//     const accountChangeHandler = (newAccount) => {
//         setUserAccount(newAccount)
//         getAccountBalance(newAccount.toString())
//     }

//     const chainChangedHandler = () => {
//         // reload the page to avoid any errors with chain change mid use of application
//         window.location.reload()
//     }

//     // listen for account changes
//     useEffect(() => {
//         const { ethereum } = window
//         ethereum.on('chainChanged', () => {
//             chainChangedHandler()
//         })
//         ethereum.on('accountsChanged', () => {
//             accountChangeHandler
//         })
//     })


//     return (
//         <div>
//             <h4> {"Connection to MetaMask using window.ethereum methods"} </h4>
//             <button onClick={connectWalletHandler}>{connectButtonText}</button>
//             <div className='accountDisplay'>
//                 <h3>Address: {userAccount}</h3>
//             </div>
//             <div className='balanceDisplay'>
//                 <h3>Balance: {userBalance}</h3>
//             </div>
//             {errorMessage}
//         </div>
//     )
// }

// export default WalletConnect
