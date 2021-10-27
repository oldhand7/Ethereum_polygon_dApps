const path = require('path');
const solc = require('solc');

// Similar to the fs module, but an improved version with extra functions
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');

// Looks at the folder and deletes everything inside of it including itself
fs.removeSync(buildPath);

const kickstarterPath = path.resolve(__dirname, 'contracts', 'Kickstarter.sol');
const source = fs.readFileSync(kickstarterPath, 'utf8');

// Only want the contracts property from compiling the smart contract
const output = solc.compile(source, 1).contracts;

// Creates build folder if it doesn't exist
fs.ensureDirSync(buildPath);

for (let contract in output) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output[contract]
    );
}