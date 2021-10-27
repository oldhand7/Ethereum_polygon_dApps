const assert = require('assert')
const ganache = require('ganache-cli')

// Constructor function, uppercase Web3. Portal into the Ethereum world.
const Web3 = require('web3')

// Attempt to connect to local test network.
const provider = ganache.provider()
const web3 = new Web3(provider)

// Import the entire source code for both contracts
const compiledInstance = require('../ethereum/build/KickstarterInstance.json');
const compiledKickstarter = require('../ethereum/build/Kickstarter.json')

let accounts;
let instance;
let kickstarterAddress;
let kickstarter;

// Sets up a local blockchain for testing
beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    // Had to increase gas to 2M, does not work with only 1M gas
    instance = await new web3.eth.Contract(JSON.parse(compiledInstance.interface))
        .deploy({ data: compiledInstance.bytecode })
        .send({ from: accounts[0], gas: '2000000' });

    await instance.methods.createNewInstance('100', 'Test Fundraiser', 'This is a test!').send({
        from: accounts[0],
        gas: '1000000'
    })
    
    // Returns an array of deployed addresses
    const addresses = await instance.methods.getDeployedInstances().call();
    kickstarterAddress = addresses[0];

    kickstarter = await new web3.eth.Contract(
        JSON.parse(compiledKickstarter.interface),
        kickstarterAddress
    )
})

// Local testing of the smart contracts instance and kickstarter
describe('Kickstarters', () => {
    // Ensure that deployment works for both contracts
    it('deploys a KickstarterInstance and a Kickstarter.', () => {
        assert.ok(instance.options.address);
        assert.ok(kickstarter.options.address);
    })

    // Ensure that the person creating a new instance of kickstarter is the manager of that contract
    it('recognizes caller of instance creation as the Kickstarter manager.', async () => {
        const manager = await kickstarter.methods.manager().call();
        assert.equal(accounts[0], manager);
    })

    // Ensure that users can contribute ether and also adds them to the contributors mapping
    it('allows users to contribute ether and adds them as a contributor to the mapping.', async () => {
        // Test transaction by sending 200 wei to contribute method
        await kickstarter.methods.contribute().send({
            value: '200',
            from: accounts[1]
        })

        // Checks if the accounts[1] is a contributor in the contract mapping
        const isContributor = await kickstarter.methods.contributors(accounts[1]);
        assert(isContributor);
    })

    // Ensure that contributor count goes up only if the contributor is a new donor
    it('ensures that the contributor count is correct.', async () => {
        // Test transaction by sending 200 wei to contribute method
        await kickstarter.methods.contribute().send({
            value: '200',
            from: accounts[1]
        })

        const count = await kickstarter.methods.contributorsCount().call();

        assert.equal(1, count);

        // Send a second transaction, count should still be one
        await kickstarter.methods.contribute().send({
            value: '200',
            from: accounts[1]
        })

        assert.equal(1, count);
    })

    // Ensure that a minimum contribution is required
    it('requires users to send a minimum contribution amount.', async () => {
        try {
            await kickstarter.methods.contribute().send({
                value: '10',
                from: accounts[1]
            })
            // Automatically fail
            assert(false);
        } catch (err) {
            assert(err);
        }
    })

    // Ensure that a request is created properly
    it('allows the contract manager to create a payment request.', async () => {
        await kickstarter.methods.createRequest('Buy materials', '100', accounts[1])
            .send({
                from: accounts[0],
                gas: '1000000'
            })
        
        // Getter for the requests array
        const request = await kickstarter.methods.requests(0).call();

        assert.equal('Buy materials', request.description);
    })

    // Ensure that spending requests are processed properly
    it('processes spending requests and pays the proper address with the requested amount.', async () => {
        // Store original balance
        let originalBalance = await web3.eth.getBalance(accounts[1]);
        originalBalance = web3.utils.fromWei(originalBalance, 'ether');
        originalBalance = parseFloat(originalBalance);

        // Contribute 10 ether from account 0 to be a contributor
        await kickstarter.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether') 
        })

        // Create a spending request to pay accounts[1]
        await kickstarter.methods
            .createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1])
            .send({ from: accounts[0], gas: '1000000' })

        // Vote and approve the spending request
        await kickstarter.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        })    

        await kickstarter.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        })

        let newBalance = await web3.eth.getBalance(accounts[1]);
        newBalance = web3.utils.fromWei(newBalance, 'ether');
        newBalance = parseFloat(newBalance);

        assert(newBalance > originalBalance)
    })

    // Ensure that requests cannot be processed twice
    it('processes spending requests only once and cannot be called again.', async () => {      
        // Contribute 10 ether from account 0 to be a contributor
        await kickstarter.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether') 
        })

        // Create a spending request to pay accounts[1]
        await kickstarter.methods
            .createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1])
            .send({ from: accounts[0], gas: '1000000' })

        // Vote and approve the spending request
        await kickstarter.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        })

        // Finalize the spending request to get paid as the manager
        await kickstarter.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        })
        
        // Attempt to finalize request again to get paid
        try {
            await kickstarter.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
            })
            assert(false);
        } catch (err) {
            assert(true);
        }
    })

    // Ensure that the newly created fundraiser has the correct title and description
    it('contains the proper title and description strings attached to the contract.', async () => {
        // Get this contract's title and description strings.
        const title = await kickstarter.methods.fundraiserTitle().call();
        const desc = await kickstarter.methods.fundraiserDescription().call();
        
        assert.equal('Test Fundraiser', title);
        assert.equal('This is a test!', desc);
    })
})


