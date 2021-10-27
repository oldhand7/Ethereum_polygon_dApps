import Web3 from 'web3';

// Take out the provider from metamask off the window
// Metamask injects web3 with its own provider into the window
// currentProvider is preconfigured to the Rinkeby test network
window.ethereum.enable();
 
const web3 = new Web3(window.ethereum);
 
export default web3;