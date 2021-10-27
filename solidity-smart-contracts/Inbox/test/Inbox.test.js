const assert = require('assert')
const ganache = require('ganache-cli')

// Constructor function, uppercase Web3. Portal into the Ethereum world.
const Web3 = require('web3')

// Attempt to connect to local test network.
const provider = ganache.provider()
const web3 = new Web3(provider)

// Requires in the raw data contract (bytecode), and ABI (interface)
const {interface, bytecode} = require('../compile')

// Variable declaration
let accounts
let inbox
const INITIAL_STRING = 'Hi there'

beforeEach(async () => {
    // Get a list of all accounts.
    accounts = await web3.eth.getAccounts()
        
    // Use one of those accounts to deploy the contract
    // Parses the JSON ABI file into a JavaScript object
    // There is a contract that has this interface.
    inbox = await new web3.eth.Contract(JSON.parse(interface))
        // We want to deploy a new contract. Data is the bytecode for the contract. 
        // Arguments is passed into the constructor function of the contract.
        .deploy({data: bytecode, arguments: [INITIAL_STRING]})
        // Send method actually sends the contract to the network.
        .send({from: accounts[0], gas: '1000000'})    

        inbox.setProvider(provider)
})

describe('Inbox', () => {
    it('deploys a contract.', () => {
        // Address property of options object, contains the address
        // wherever the Contract address is. Checks to ensure that 
        // a defined value exists. If null or undefined, it will fail. 
        assert.ok(inbox.options.address)
    })

    it('has a default message.', async () => {
        // Inbox is a JS representation of the Contract that resides on the blockchain. 
        // Contains a property methods that contains all the methods tied to the Contract. 
        // First (): allows us to put in arguments into the method.
        // Second (): passes in object to specify who pays for the transaction, gas cost.
        const message = await inbox.methods.message().call();
        assert.equal(message, INITIAL_STRING)
    })

    it('can modify the message.', async () => {
        // We get back the transaction id if it succeeds. 
        await inbox.methods.setMessage('bye').send({ from: accounts[0] })
        const message = await inbox.methods.message().call()
        assert.equal(message, 'bye')
    })
})