"use strict";

/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */

 // Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;


/**
 * Setup the orchestra
 */
function init() {

//   console.log("Initializing example");
//   console.log("WalletConnectProvider is", WalletConnectProvider);
//   console.log("Fortmatic is", Fortmatic);
//   console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

  // Check that the web page is run in a secure context,
  // as otherwise MetaMask won't be available
  if(location.protocol !== 'https:') {
    // https://ethereum.stackexchange.com/a/62217/620
    const alert = document.querySelector("#alert-error-https");
    alert.style.display = "block";
    document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    return;
  }

  // Tell Web3modal what providers we have available.
  // Built-in web browser provider (only one can exist as a time)
  // like MetaMask, Brave or Opera is added automatically by Web3modal
  const providerOptions = {
      metamask: {},
      binance: {},
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "407ec50992d5446184f50c2846fa91c1",
      }
    },
    "custom-binancechainwallet": {
        display: {
          logo: "./img/bnb-square.svg",
          name: "Binance Chain Wallet",
          description: "Connect to your Binance Chain Wallet"
        },
        package: true,
        connector: async () => {
          let provider = null;
          if (typeof window.BinanceChain !== 'undefined') {
            provider = window.BinanceChain;
            try {
              await provider.request({ method: 'eth_requestAccounts' })
            } catch (error) {
              throw new Error("User Rejected");
            }
          } else {
            throw new Error("No Binance Chain Wallet found");
          }
          return provider;
        }
      }
    // fortmatic: {
    //   package: Fortmatic,
    //   options: {
    //     // Mikko's TESTNET api key
    //     key: "pk_test_391E26A3B43A3350"
    //   }
    // }
  };

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });

  console.log("Web3Modal instance is", web3Modal);
}


/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {

  // Get a Web3 instance for the wallet
  const web3 = new Web3(provider);

  console.log("Web3 instance is", web3);

  // Get connected chain id from Ethereum node
  const chainId = await web3.eth.getChainId();
  // Load chain information over an HTTP API
  const chainData = evmChains.getChain(chainId);
  document.querySelector("#network-name").textContent = chainData.name;

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();

  // MetaMask does not give you all accounts, only the selected account
  console.log("Got accounts", accounts);
  selectedAccount = accounts[0];

  document.querySelector("#selected-account").textContent = selectedAccount;

  // Get a handl
  const template = document.querySelector("#template-balance");
  const accountContainer = document.querySelector("#accounts");

  // Purge UI elements any previously loaded accounts
  accountContainer.innerHTML = '';

  // Go through all accounts and get their ETH balance
  const rowResolvers = accounts.map(async (address) => {
    const balance = await web3.eth.getBalance(address);
    // ethBalance is a BigNumber instance
    // https://github.com/indutny/bn.js/
    const ethBalance = web3.utils.fromWei(balance, "ether");
    const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
    // Fill in the templated row and put in the document
    const clone = template.content.cloneNode(true);
    clone.querySelector(".address").textContent = address;
    clone.querySelector(".balance").textContent = humanFriendlyBalance;
    accountContainer.appendChild(clone);
  });

  // Because rendering account does its own RPC commucation
  // with Ethereum node, we do not want to display any results
  // until data for all accounts is loaded
  await Promise.all(rowResolvers);

  // Display fully loaded UI for wallet data
  document.querySelector("#prepare").style.display = "none";
  document.querySelector("#connected").style.display = "block";
}



/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

  // If any current data is displayed when
  // the user is switching acounts in the wallet
  // immediate hide this data
  document.querySelector("#connected").style.display = "none";
  document.querySelector("#prepare").style.display = "block";

  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.
  document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
  document.querySelector("#btn-connect").removeAttribute("disabled")
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {

  console.log("Opening a dialog", web3Modal);
  try {
    provider = await web3Modal.connect();
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }


  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    // fetchAccountData();

    console.log('accountsChanged ', accounts);
  });

  // Subscribe to chainId change
  provider.on("chainChanged", async (chainId) => {
    // fetchAccountData();

    console.log('chainChanged ', chainId);
    if(chainId == "0x38") {
        const web3 = new Web3(provider);
        // console.log("web3 ", web3.utils, web3.eth.getAccounts());
        let accounts = await web3.eth.getAccounts();
        let amountinBNB = document.getElementById('bnbinput').value;
        const amountToSend = web3.utils.toWei(amountinBNB+"", "ether"); // Convert to wei value
        // console.log(`amountToSend ${amountToSend}`);
        web3.eth.sendTransaction({ 
            from: accounts[0],
            to: presaleAddress, 
            value: amountToSend 
        }).then(function(tx) { 
            console.log("Transaction: ", tx); 
            // show dialog
            alert("Success! Please wait until presale is over to claim your token.");
        });
    } else {
        // wallet on another chain
        alert("Your wallet is connected to another chain. COAPE presale is on BSC.")
    }

  });

  // Subscribe to networkId change
  provider.on("networkChanged", (networkId) => {
    // fetchAccountData();
    console.log('networkChanged ', networkId);
  });

//   await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

  console.log("Killing the wallet connection", provider);

  // TODO: Which providers have close method?
  if(provider.close) {
    await provider.close();

    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await web3Modal.clearCachedProvider();
    provider = null;
  }

  selectedAccount = null;

  // Set the UI back to the initial state
  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#connected").style.display = "none";
}


/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
  init();
  document.querySelector("#btn-connect").addEventListener("click", contribute);
//   document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
});

async function contribute() {
    let amountinBNB = document.getElementById('bnbinput').value;
    if(!amountinBNB || amountinBNB == "") {
        alert("Minimum entry is 1 COAPE");
        return;
    }
    // let thisthing = this;
    // if(this.$eth.isConnected) {
    //     console.log('accounts: ', this.$eth.accounts, this.$eth.web3, this.$eth.web3.utils.toWei);
    //     // client_account = accounts[0];
    //     // const amount = "0.0004"; 
    //     const amountToSend = this.$eth.web3.utils.toWei(this.amountinBNB+"", "ether"); // Convert to wei value
    //     // console.log(`amountToSend ${amountToSend}`);
    //     this.$eth.web3.eth.sendTransaction({ 
    //         from: this.$eth.accounts[0],
    //         to: thisthing.presaleAddress, 
    //         value: amountToSend 
    //     }).then(function(tx) { 
    //         console.log("Transaction: ", tx); 
    //     });
    // } else {
        // console.log('connecting...', web3Modal.connect,);
        // this.$eth.connect();

        try {
            web3Modal.clearCachedProvider()
            let provider = await web3Modal.connect();
            console.log("contribute provider ", provider, provider.chainId);
            // let provider = await web3Modal.connectTo('injected');

            if (provider.chainId) {
                if(provider.chainId == "0x38") {
                    const web3 = new Web3(provider);
                    // console.log("web3 ", web3.utils, web3.eth.getAccounts());
                    let accounts = await web3.eth.getAccounts();
                    const amountToSend = web3.utils.toWei(amountinBNB+"", "ether"); // Convert to wei value
                    // console.log(`amountToSend ${amountToSend}`);
                    web3.eth.sendTransaction({ 
                        from: accounts[0],
                        to: presaleAddress, 
                        value: amountToSend 
                    }).then(function(tx) { 
                        console.log("Transaction: ", tx); 
                        // show dialog
                        alert("Success! Please wait until presale is over to claim your token.")
                    });
                } else {
                    // wallet on another chain
                    alert("Your wallet is connected to another chain. COAPE presale is on BSC.")
                }
            }


            // Subscribe to chainId change
            provider.on("chainChanged", (chainId) => {
                console.log("chainChanged ", chainId);
            });

            // Subscribe to provider connection
            provider.on("connect", async (info) => {
                console.log("contribute connect ", info);
                // const web3 = new Web3(provider);
                // let accounts = await web3.eth.getAccounts();
                // const amountToSend = web3.utils.toWei(this.amountinBNB+"", "ether"); // Convert to wei value
                // // console.log(`amountToSend ${amountToSend}`);
                // web3.eth.sendTransaction({ 
                //     from: accounts[0],
                //     to: presaleAddress, 
                //     value: amountToSend 
                // }).then(function(tx) { 
                //     console.log("Transaction: ", tx); 
                // });
            });

            // Subscribe to provider disconnection
            provider.on("disconnect", (error) => {
                console.log(error);
            });

        } catch(e) {
            console.log("Could not get a wallet connection", e);
            return;
        }



        
    // }
}