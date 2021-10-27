// Helps us build a path / directory from the current compile.js file to Inbox.sol file
const path = require('path')
const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol')
const fs = require('fs')

// Solidity compiler
const solc = require('solc')

// Reads in the content of the source file.
const source = fs.readFileSync(lotteryPath, 'utf8')

module.exports = solc.compile(source, 1).contracts[':Lottery']
