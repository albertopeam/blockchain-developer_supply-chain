const HDWalletProvider = require("@truffle/hdwallet-provider");
const infuraDevKey = process.env.INFURA_DEVELOPMENT_PROJECT_ID;
const metamaskDevMnemonic = process.env.METAMASK_DEVELOPER_MNEMONIC;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider(metamaskDevMnemonic, `https://rinkeby.infura.io/v3/${infuraDevKey}`),
      network_id: 4,
      gas: 4500000,        
      gasPrice: 10000000000
    },
  },
  compilers: {
    solc: {
      version: "^0.8.10"
    }
  }
};