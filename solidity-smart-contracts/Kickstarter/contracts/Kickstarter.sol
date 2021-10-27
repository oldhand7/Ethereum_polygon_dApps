pragma solidity ^0.4.17;

contract KickstarterInstance {
    address[] public deployedInstances;

    // Creates a newly deployed instance of the Kickstarter contract
    function createNewInstance(uint minimum) public {
        // Returns address of newly created campaign
        address newKickstarter = new Kickstarter(minimum, msg.sender);

        deployedInstances.push(newKickstarter);
    }

    // Gets all the deployed instances of the Kickstarter contract
    function getDeployedInstances() public view returns (address[]) {
        return deployedInstances;
    }
}

contract Kickstarter {
    // Struct definition for a Request to spend contract ethereum
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint numOfYesVotes;
        mapping(address => bool) votedContributors;
    }
    
    // Contract holds an array of Requests
    Request[] public requests;
    
    // Contract data members, used a mapping for contributors
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public contributors;
    uint public contributorsCount;
    
    // Modifier function to be used for the functions below
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    // Constructor function for this contract
    function Kickstarter(uint minimum, address owner) public {
        manager = owner;
        minimumContribution = minimum;
        contributorsCount = 0;
    }
    
    // Contribute function, value sent in wei along must meet the minimum contribution amount
    function contribute() public payable {
        require(msg.value > minimumContribution);
        
        // Uses the mapping index at msg.sender, only the value is stored in the mapping
        contributors[msg.sender] = true;

        // Add the contributors count variable
        contributorsCount++;
    }
    
    // Function to create a Request for this contract
    function createRequest(string description, uint value, address recipient) public restricted {
        // storage keyword changes how the variable behave. Makes the variable point to the storage data structure
        // memory keyword creates a copy of the object in memory, and makes the variable point to this temp object
        Request memory newRequest = Request({
           description: description,
           value: value,
           recipient: recipient,
           complete: false,
           numOfYesVotes: 0
        });
        
        requests.push(newRequest);
    }

    // Function for contributors to vote and approve spending requests
    function approveRequest(uint index) public {
        // Create a storage variable so we can reuse it
        Request storage request = requests[index];

        // Ensure that the caller of this approval function is on the list of contributors
        require(contributors[msg.sender]);

        // Ensure that the caller has not already voted on the request
        require(!request.votedContributors[msg.sender]);

        request.votedContributors[msg.sender] = true;
        request.numOfYesVotes++;
    }

    // Function for the contract manager to finalize a request
    function finalizeRequest(uint index) public restricted {
        // Create a storage variable to be reused to minimize overhead
        Request storage request = requests[index];

        // First check the request is not already marked as complete
        require(!request.complete);

        // Require that at least half of all contributors have approved
        require(request.numOfYesVotes > (contributorsCount / 2));

        // Transfer the ethereum from contract to the merchant account being paid
        request.recipient.transfer(request.value);

        // Mark this request as completed
        request.complete = true;
    }
}