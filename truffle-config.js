
module.exports = {
 
  networks: {

    ganache: {
     host: '127.0.0.1',
     port: 7545,
     network_id: '*',
    },

    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // match any network
      gas: 8500000,  // Gas sent with each transaction (default: ~6700000)
      gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
     
    },

    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01      // <-- Use this low gas price
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.4.24"
    }
  }
}
