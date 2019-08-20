const fs = require('fs');
var defaultnode = "https://sauravskv07.blockchain.azure.com:3200/_XxyoMd1R-7MNrLH7KaiCqiJ";
var Web3 = require("web3");
var HDWalletProvider = require("truffle-hdwallet-provider");

var defaultnode = "https://sauravskv07.blockchain.azure.com:3200/_XxyoMd1R-7MNrLH7KaiCqiJ";
var Web3 = require("web3");
module.exports = {
  networks: {
<<<<<<< HEAD
    defaultnode: {
      provider: new Web3.providers.HttpProvider(defaultnode),
      network_id: "*"
    },
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    votingsystem: {
      network_id: "*",
      gas: 5000000,
      gasPrice: 0,
      provider: new HDWalletProvider(fs.readFileSync('c:\\Users\\user\\Desktop\\Mnemonic1.env', 'utf-8'), "https://sauravskv07.blockchain.azure.com:3200/_XxyoMd1R-7MNrLH7KaiCqiJ"),
      consortium_id: 1566214976150
    }
=======
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
     defaultnode:{
       provider: new Web3.providers.HttpProvider(defaultnode),
       network_id: "*",
      },
     development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
     },

    // Another network with more advanced options...
    // advanced: {
      // port: 8777,             // Custom port
      // network_id: 1342,       // Custom network
      // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
      // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
      // from: <address>,        // Account to send txs from (default: accounts[0])
      // websockets: true        // Enable EventEmitter interface for web3 (default: false)
    // },

    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    // ropsten: {
      // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
      // network_id: 3,       // Ropsten's id
      // gas: 5500000,        // Ropsten has a lower block limit than mainnet
      // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    // },

    // Useful for private networks
    // private: {
      // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
      // network_id: 2111,   // This network is yours, in the cloud.
      // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
>>>>>>> a8ab45e2be3918cc87f2e3a06872dec3e279c2eb
  },
  mocha: {},
  compilers: {
    solc: {}
  }
};
