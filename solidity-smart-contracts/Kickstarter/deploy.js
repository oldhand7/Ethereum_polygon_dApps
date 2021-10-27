const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const { interface, bytecode } = require('./compile.js')

// First string is to unlock an account on this network, second string specifies which network to connect to.
const provider = new HDWalletProvider(
    // Test account mnemonic. Second string is infura's Ethereum node on the rinkeby test network.
    'popular myself alter evolve extra fringe vault cabin host episode element grant',
    'https://rinkeby.infura.io/v3/10b22c7c02744f43b09d0494cbfb32e2'
)

// Can now use the web3 instance to interact with the Rinkeby network.
const web3 = new Web3(provider)

const deploy = async () => {
    const accounts = await web3.eth.getAccounts()

    console.log('Attempting to deploy from account: ', accounts[0])

    // Once deployed, will get a transaction id for deploying the Contract.
    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: '0x' + bytecode, arguments: [100]}) // add 0x bytecode
        .send({from: accounts[0], gas: '1000000'})  
        //.send({from: accounts[0]}); // remove 'gas'

    console.log(interface)    
    console.log('Contract deployed to ', result.options.address)    
}
deploy()