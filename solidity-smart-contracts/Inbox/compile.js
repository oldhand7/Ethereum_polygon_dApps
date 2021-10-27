// Helps us build a path / directory from the current compile.js file to Inbox.sol file
const path = require('path')
const inboxPath = path.resolve(__dirname, 'contracts', 'Inbox.sol')
const fs = require('fs')

// Solidity compiler
const solc = require('solc')

// Reads in the content of the source file.
const source = fs.readFileSync(inboxPath, 'utf8')

module.exports = solc.compile(source, 1).contracts[':Inbox']
