import Web3 from 'web3';

let web3;

// Conditionals to see if we are running on the server or browser.
if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    
    // This is for the browser side and metamask is running.
    web3 = new Web3(window.web3.currentProvider);
} else {
    // This is for the server side or metamask is not running.
    const provider = new Web3.providers.HttpProvider(
        'https://rinkeby.infura.io/v3/10b22c7c02744f43b09d0494cbfb32e2'
    )
    
    // Created our own provider through the use of infura.
    web3 = new Web3(provider);
}

export default web3;