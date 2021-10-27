// Standard node library
const assert = require('assert')

// Local test network, gets created when running the test
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
let lottery

beforeEach(async () => {
    // Get a list of all accounts.
    accounts = await web3.eth.getAccounts()
        
    // Use one of those accounts to deploy the contract
    // Parses the JSON ABI file into a JavaScript object
    // There is a contract that has this interface.
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        // We want to deploy a new contract. Data is the bytecode for the contract. 
        .deploy({data: bytecode})
        // Send method actually sends the contract to the network.
        .send({from: accounts[0], gas: '1000000'})    

        lottery.setProvider(provider)
})

describe('Lottery Contract', () => {
    it('deploys a contract.', () => {
        // Address property of options object, contains the address
        // wherever the Contract address is. Checks to ensure that 
        // a defined value exists. If null or undefined, it will fail. 
        assert.ok(lottery.options.address)
    })

    it('allows one account to enter.', async () => {
        await lottery.methods.enterLottery().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        })

        const players = await lottery.methods.getAllPlayers().call({
            from: accounts[0]
        })

        assert.equal(accounts[0], players[0])
        assert.equal(1, players.length)
    })

    it('allows multiple accounts to enter.', async () => {
        await lottery.methods.enterLottery().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        })

        await lottery.methods.enterLottery().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        })

        await lottery.methods.enterLottery().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        })

        const players = await lottery.methods.getAllPlayers().call({
            from: accounts[0]
        })
        
        assert.equal(accounts[0], players[0])
        assert.equal(accounts[1], players[1])
        assert.equal(accounts[2], players[2])
        assert.equal(3, players.length)
    })

    it('requires a minimum amount of ether to enter.', async () => {
        // This should go to the catch block since you need ether to process a transaction.
        try {
            await lottery.methods.enter().send({
            from: accounts[0],
            value: 0
            })
            assert(false)
        } catch (err) {
            assert(err)
        }
    })

    it('only contract manager can call pickWinner function.', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1] // Not the manager account
            })
            assert(false) // Automatically fail the test if this worked.
        } catch (err) {
            assert(err)
        }
    })

    it('contract sends money to the winner and resets the array of players.', async () => {
        // Sends two ether to the lottery contract, with only 1 player in the players array.
        await lottery.methods.enterLottery().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        })

        // Stores initial account balance after entering the lottery.
        const initialBalance = await web3.eth.getBalance(accounts[0])

        // Calls the pick winner function in the contract.
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        })

        const finalBalance = await web3.eth.getBalance(accounts[0])

        // Difference should be around 2 ethers minus the gas cost after winning the lottery.
        const differenceOfBalance = finalBalance - initialBalance
        assert(differenceOfBalance > web3.utils.toWei('1.9', 'ether'))

        // Contract should now be reset with no players in the players array.
        const players = await lottery.methods.getAllPlayers().call({
            from: accounts[0]
        })

        assert.equal(players.length, 0)
    })
})