import web3 from './web3';
import Kickstarter from './build/Kickstarter.json';

// Takes in a contract address and returns an instance of the fundraiser contract.
export default (address) => {
    return new web3.eth.Contract(JSON.parse(Kickstarter.interface), address);
};