pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address public lastWinner;
    address[] public players;
    
    function Lottery() public {
        // msg is a global variable, always available to be used
        manager = msg.sender;
    }
    
    // When someone calls this function, they might send ether along - payable
    // Stores the sender's address into the players array.
    function enterLottery() public payable {
        // Global function that we can call for validation.
        // If the expression evaluates to false, the whole function exits and 
        // no changes are made. If true, rest of the function is executed.
        require(msg.value > .01 ether);
        
        players.push(msg.sender);
    }
    
    function random() private view returns (uint) {
        // Global function for a hashing algorithm SHA-3
        // block is a global variable accessible anytime
        // Uses multiple inputs for a pseudo random number generator.
        return uint(keccak256(block.timestamp, block.difficulty, now, block.blockhash(block.number)));
    }
    
    function pickWinner() public restrictedAccess {
        // Index will be 0 to players.length - 1 using modulo players.length.
        uint index = random() % players.length;
        
        // Access to the winner index. IE. 0x2482039230df2092332...
        // .transfer() is available to any address object.
        players[index].transfer(address(this).balance);

        // Store the address of last winner so we can show users who won the last raffle
        lastWinner = players[index];
        
        // Reset the dynamic players array so the contract is ready to go again. Sets initial size of 0.
        players = new address[](0);
    }
    
    function getAllPlayers() public view returns (address[]) {
        return players;
    }
    
    function getNumPlayers() public view returns (uint) {
        return players.length;
    }
    
    // Function modifier for cleaner code. Function code is put where the underscore is.
    modifier restrictedAccess() {
        // Only allow the manager of the contract to call this function.
        require(msg.sender == manager);
        _;
    }
}