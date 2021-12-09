# Documentation

## Contracts

SupplyChain contract deployed on rinkeby, details on [etherscan](https://rinkeby.etherscan.io/address/0x0994a97788630FB70ed46a1a43afBAA060F4473e)

SupplyChain contract

    Transaction ID      0xa67fbeafc7dbd66c675de3f922e91b460427c2b047d9473303a0ddfb9d817494  
    Contract address    0x0994a97788630FB70ed46a1a43afBAA060F4473e

FarmerRole contract

    Transaction ID      0x789e60af998cdc0045a8ff1726ceb0b931eb5776c297b2c09109530b8c4c37a2
    Contract address    0x49dd7c79D9A53a7Ac72FacA85bA78Dc2decc7Dc9

DistributorRole contract

    Transaction ID      0x5669a54840bbd4d493b6f24ce5e97fd997fcabdb5775b23a2785c802dfc80d07
    Contract address    0x94483098E090494e1B4c7528b8a4d3C411e8D639

RetailerRole contract

    Transaction ID      0x6b49f2309a38686d40fb4f1808e18d324583da18d67d0896aea37153369d7715
    Contract address    0xFd9f29Ff00E6F84Ba9f13919B7d74f3976e1abD3

ConsumerRole contract

    Transaction ID      0x9c30fe99a174948cb1334a8ac97f742f6e917b41ed029c168ba363d82b873e38
    Contract address    0xB5ee4d0e2b23514cb067174f6E79B67Fb71ea820

## Website

[Website](https://ipfs.io/ipfs/QmZjgiJhD2BAHXSyoMsDybKJ2bwLHsJZ7iJYAAK1dDGvDG/) deployed on IPFS

Distribute info:

    1. Copy app/src dir & build/contracts/SupplyChain.json into a directory, ie: `distribution` dir
    2. Upload the directory to your ipfs provider

## Specs

* truffle-assertions: used to test events emitted by contracts
* web3: used in the frontend to be able to interact with ethereum network
* truffleContract: used in the frontend to be able to load the contract interface(from its JSON representation) to interact with the deployed backend. I had some issues with embedded truffleContract
* pinata cloud(IPFS): used to host the frontend to help reviewer using the dapp. hosted on [pinata cloud](https://www.pinata.cloud/)

## Program version numbers

* Truffle v5.4.17 (core: 5.4.17)
* Solidity ^0.8.10 (solc-js)
* Node v12.22.6
* Web3.js v1.5.3

## Backend development/testing

Setup the environment:

 1. having installed truffle(if not `npm install -g truffle` to install it globally, if only needed locally then skip this step)
 2. having installed ganache to have a local blockchain(if not download from [link](https://trufflesuite.com/ganache/) or install it via command line)
 3. `cd` into the project folder
 4. `npm install` to resolve package dependencies(if not installed truffle globally then `npm install truffle`)
 5. open project dir in your favourite editor
 6. start ganache and check the port number where it is running, open `truffle.js` and verify that it matches with the development network port, if not update it
 7. if the backend is going to be deployed on a network is mandatory to have an infura api key and the wallet mnemonic(if not needed skip this step). Both can we stored locally on your computer as environment variables. Edit the `truffle.js` file, lines 2 & 3 to support your env variables or your preferred method.
 8. From the command line
    * compile: `truffle compile` or `truffle develop` & `compile`
    * run the tests: `truffle test` or `test`(if used in the 1st step `truffle develop`)
    * deploy: `truffle deploy --network [network name]` or `deploy --network [network name]`(if used in the 1st step `truffle develop`)

## Frontend development

Setup the environment:

1. Having metamask extension installed and selected the appropiate network(`localhost:port` -> match ganache one)
2. Enter `app` directory
3. `npm install` to resolve lite-server dependency
4. start local server using `npm run dev`, it will serve the `index.html`

Operate the website

1. You can see the website with placeholders
2. If you are the deployer of the contract you will have all the needed roles for this step and next ones. 
3. Locate harvest button and edit the data in the form as needed. Tap `harvest`, this will open a metamask with a transaction. Sign it and wait until confirmation. At the bottom of the frontend you will see the details of the transaction once its done.
4. Locate `process` button and tap it, we are telling the system to change the state of the product as processed. The farmer is the only capable of doing that.
5. Locate `pack` button and tap it, we are telling the system to change the state of the product as packed. The farmer is the only capable of doing that.
6. Locate `sell` button and tap it, we are telling the system to change the state of the product as forSale. The farmer is the only capable of doing that.
7. Locate `buy` button and tap it, we are telling the system to change the state of the product as sold. The distributor is the only capable of doing that.
8. Locate `ship` button and tap it, we are telling the system to change the state of the product as shipped. The distributor is the only capable of doing that.
9. Locate `receive` button and tap it, we are telling the system to change the state of the product as received. The retailer is the only capable of doing that.
10. Locate `purchase` button and tap it, we are telling the system to change the state of the product as purchased. The consumer is the only capable of doing that.

Note that all these previous steps are coordinated as a supply chain and in each stage is required that the appropiate role/user interacts to move the product on the chain.

To verify the identity and origin of the product is possible using the `fetch` buttons at the top of the frontend.

## Diagrams

Activity

![Activity diagram](uml/activityDiagram.jpg)

Sequence

![Sequence diagram](uml/sequenceDiagram.jpg)

State

![State diagram](uml/stateDiagram.jpg)

Class

![Class diagram](uml/classDiagram.jpg)
