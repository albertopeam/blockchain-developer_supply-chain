// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within

// Declare a variable and assign the compiled smart contract artifact
const SupplyChain = artifacts.require('SupplyChain')
const truffleAssert = require('truffle-assertions')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]    
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei("1", "ether")
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'
    const secondFarmerID = accounts[5]
    const secondDistribuitorID = accounts[6]

    console.log("Accounts")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    beforeEach('Setup', async () => {
        sut = await SupplyChain.deployed()
    })

    it("when invoke constructor then only caller is owner", async() => {
        assert.equal(await sut.isOwner(), true);
        assert.equal(await sut.owner(), ownerID);    
        assert.notEqual(await sut.owner(), originFarmerID);
        assert.notEqual(await sut.owner(), distributorID);
        assert.notEqual(await sut.owner(), retailerID);
        assert.notEqual(await sut.owner(), consumerID);
    })

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {    
        const txHash = await sut.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)
        const resultBufferOne = await sut.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await sut.fetchItemBufferTwo.call(upc)
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
        truffleAssert.eventEmitted(txHash, 'Harvested', (ev) => { return ev.upc == upc })  
    })   
    
    it("when harvestItem is invoked using an already added UPC then revert", async () => {
        await sut.harvestItem(2, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)
        await truffleAssert.reverts(
            sut.harvestItem(2, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes),
            "UPC already exists"
        ); 
    })

    it("when harvestItem is invoked by other role than farmer then revert", async () => {
        await truffleAssert.reverts(
            sut.harvestItem(3, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: distributorID}),
            "Only farmers can do this action"
        ); 
    })

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {        
        await sut.addFarmer(originFarmerID)
        await sut.harvestItem(4, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})
        const txHash = await sut.processItem(4, {from: originFarmerID})
        const item = await sut.fetchItemBufferTwo(4)
        assert.equal(item.itemState, 1)
        truffleAssert.eventEmitted(txHash, 'Processed', (ev) => { return ev.upc == 4 })  
    })
    
    it("when processItem is invoked from a different farmer than harvested it then revert", async() => {
        await sut.addFarmer(secondFarmerID)
        await sut.harvestItem(5, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)
        await truffleAssert.reverts(sut.processItem(5, {from: secondFarmerID}), "Caller can't do this action");
    })

    it("when processItem is invoked using an non existing UPC then revert", async() => {
        await truffleAssert.reverts(sut.processItem(100), "UPC doesn't exist");
    })

    it("when processItem is invoked by other role than farmer then revert", async() => {
        await truffleAssert.reverts(sut.processItem(upc, {from: distributorID}), "Only farmers can do this action");
    })

    it("when processItem is invoked from a invalid previous state then revert", async() => {
        await sut.harvestItem(6, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})
        await sut.processItem(6, {from: originFarmerID})        
        await truffleAssert.reverts(sut.processItem(6, {from: originFarmerID}), "Not in harvested state")
    })

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        await sut.harvestItem(7, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})
        await sut.processItem(7, {from: originFarmerID})
        const txHash = await sut.packItem(7, {from: originFarmerID})
        const item = await sut.fetchItemBufferTwo(7)
        assert.equal(item.itemState, 2)
        truffleAssert.eventEmitted(txHash, 'Packed', (ev) => { return ev.upc == 7 })  
    })    

    it("when packItem is invoked by other role than farmer then revert", async() => {
        await truffleAssert.reverts(sut.packItem(upc, {from: distributorID}), "Only farmers can do this action");
    })

    it("when processItem is invoked using an non existing UPC then revert", async() => {
        await truffleAssert.reverts(sut.processItem(100), "UPC doesn't exist");
    })

    it("when packItem is invoked from a invalid previous state then revert", async() => {
        await sut.harvestItem(8, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})
        await truffleAssert.reverts(sut.packItem(8, {from: originFarmerID}), "Not in processed state")
    })

    it("when packItem is invoked from a different farmer than harvested it then revert", async() => {
        await sut.harvestItem(9, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)
        await sut.processItem(9, {from: originFarmerID})
        await truffleAssert.reverts(sut.packItem(9, {from: secondFarmerID}), "Caller can't do this action");
    })

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        await sut.harvestItem(10, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})
        await sut.processItem(10, {from: originFarmerID})
        await sut.packItem(10, {from: originFarmerID})
        const txHash = await sut.sellItem(10, productPrice, {from: originFarmerID})
        const item = await sut.fetchItemBufferTwo(10)
        assert.equal(item.itemState, 3)
        assert.equal(item.productPrice, productPrice)
        truffleAssert.eventEmitted(txHash, 'ForSale', (ev) => { return ev.upc == 10 })    
    })    

    it("when sellItem is invoked by other role than farmer then revert", async() => {
        await truffleAssert.reverts(sut.sellItem(upc, productPrice, {from: distributorID}), "Only farmers can do this action");
    })

    it("when sellItem is invoked using an non existing UPC then revert", async() => {
        await truffleAssert.reverts(sut.sellItem(100, productPrice), "UPC doesn't exist");
    })

    it("when sellItem is invoked from a invalid previous state then revert", async() => {
        await sut.harvestItem(11, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})
        await truffleAssert.reverts(sut.sellItem(11, productPrice, {from: originFarmerID}), "Not in packed state")
    })

    it("when sellItem is invoked from a different farmer than harvested it then revert", async() => {
        await sut.harvestItem(12, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)
        await sut.processItem(12, {from: originFarmerID})
        await sut.packItem(12, {from: originFarmerID})
        await truffleAssert.reverts(sut.sellItem(12, productPrice, {from: secondFarmerID}), "Caller can't do this action");
    })

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        await sut.addDistributor(distributorID)        
        const itemUPC = 13   
        await sut.harvestItem(itemUPC, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})
        await sut.processItem(itemUPC, {from: originFarmerID})
        await sut.packItem(itemUPC, {from: originFarmerID})
        await sut.sellItem(itemUPC, productPrice, {from: originFarmerID})

        const originFarmerBalance = await web3.eth.getBalance(originFarmerID)
        const distribuitorBalance = await web3.eth.getBalance(distributorID)
        const txHash = await sut.buyItem(itemUPC, {from: distributorID, value: web3.utils.toWei("1", "ether")})
        const originFarmerBalanceAfter = await web3.eth.getBalance(originFarmerID)
        const distribuitorBalanceAfter = await web3.eth.getBalance(distributorID)
        
        const item1 = await sut.fetchItemBufferOne(itemUPC)
        assert.equal(item1.ownerID, distributorID)
        const item2 = await sut.fetchItemBufferTwo(itemUPC)
        assert.equal(item2.distributorID, distributorID)
        assert.equal(item2.itemState, 4)
        truffleAssert.eventEmitted(txHash, 'Sold', (ev) => { return ev.upc == itemUPC })
        const gasUsed = txHash.receipt.gasUsed
        const tx = await web3.eth.getTransaction(txHash.tx);
        const gasPricePerUnit = tx.gasPrice;
        const gasPrice = web3.utils.toBN(gasUsed).mul(web3.utils.toBN(gasPricePerUnit))
        const productPriceBN = web3.utils.toBN(productPrice)
        const expectedFarmerBalance = web3.utils.toBN(originFarmerBalance).add(productPriceBN).toString()
        assert.equal(originFarmerBalanceAfter, expectedFarmerBalance)
        const expectedDistribuitorBalance = web3.utils.toBN(distribuitorBalance).sub(gasPrice).sub(productPriceBN).toString()
        assert.equal(distribuitorBalanceAfter, expectedDistribuitorBalance)
    })    

    it("when buyItem is invoked by other role than distributor then revert", async() => {
        await truffleAssert.reverts(sut.buyItem(upc, {from: originFarmerID}), "Only distributors can do this action");
    })

    it("when buyItem is invoked using an non existing UPC then revert", async() => {
        await truffleAssert.reverts(sut.buyItem(100), "UPC doesn't exist");
    })

    it("when buyItem is invoked from a invalid previous state then revert", async() => {
        await sut.harvestItem(14, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})
        await truffleAssert.reverts(sut.buyItem(14, {from: distributorID}), "Not in for sale state")
    })

    it("when buyItem is invoked with less ether than price then revert", async() => {
        const value = web3.utils.toWei("1", "wei")
        await sut.harvestItem(15, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)
        await sut.processItem(15, {from: originFarmerID})
        await sut.packItem(15, {from: originFarmerID})
        await sut.sellItem(15, productPrice, {from: originFarmerID});
        await truffleAssert.reverts(sut.buyItem(15, {from: distributorID, value: value}), "Not enough ether to pay");
    })

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const itemUPC = 16
        await sut.harvestItem(itemUPC, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)
        await sut.processItem(itemUPC, {from: originFarmerID})
        await sut.packItem(itemUPC, {from: originFarmerID})
        await sut.sellItem(itemUPC, productPrice, {from: originFarmerID})
        await sut.buyItem(itemUPC, {from: distributorID, value: web3.utils.toWei("1", "ether")})
        const txHash = await sut.shipItem(itemUPC, {from: distributorID})
        truffleAssert.eventEmitted(txHash, 'Shipped', (ev) => { return ev.upc == itemUPC })
        const item = await sut.fetchItemBufferTwo(itemUPC)
        assert.equal(item.itemState, 5)
    })  
    
    it("when shipItem is invoked by other role than distributor then revert", async() => {
        await truffleAssert.reverts(sut.shipItem(upc, {from: originFarmerID}), "Only distributors can do this action");
    })

    it("when shipItem is invoked using an non existing UPC then revert", async() => {
        await truffleAssert.reverts(sut.shipItem(100), "UPC doesn't exist");
    })

    it("when shipItem is invoked from a different distribuitor than bought it then revert", async() => {
        await sut.addDistributor(secondDistribuitorID)
        await sut.harvestItem(17, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)
        await sut.processItem(17, {from: originFarmerID})
        await sut.packItem(17, {from: originFarmerID})
        await sut.sellItem(17, productPrice, {from: originFarmerID})
        await sut.buyItem(17, {from: distributorID, value: web3.utils.toWei("1", "ether")})
        await truffleAssert.reverts(sut.shipItem(17, {from: secondDistribuitorID}), "Caller can't do this action");
    })

    it("when shipItem is invoked from a invalid previous state then revert", async() => {
        await sut.harvestItem(18, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})
        await truffleAssert.reverts(sut.shipItem(18, {from: distributorID}), "Not in sold state")
    })

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        sut.addRetailer(retailerID)
        const itemUPC = 19
        await sut.harvestItem(itemUPC, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)
        await sut.processItem(itemUPC, {from: originFarmerID})
        await sut.packItem(itemUPC, {from: originFarmerID})
        await sut.sellItem(itemUPC, productPrice, {from: originFarmerID})
        await sut.buyItem(itemUPC, {from: distributorID, value: web3.utils.toWei("1", "ether")})
        await sut.shipItem(itemUPC, {from: distributorID})
        const txHash = await sut.receiveItem(itemUPC, {from: retailerID})

        truffleAssert.eventEmitted(txHash, 'Received', (ev) => { return ev.upc == itemUPC })
        const item1 = await sut.fetchItemBufferOne(itemUPC)
        assert.equal(item1.ownerID, retailerID) 
        const item2 = await sut.fetchItemBufferTwo(itemUPC)
        assert.equal(item2.itemState, 6)         
        assert.equal(item2.retailerID, retailerID)  
    })  

    it("when receiveItem is invoked by other role than retailer then revert", async() => {
        await truffleAssert.reverts(sut.receiveItem(upc, {from: originFarmerID}), "Only retailers can do this action");
    }) 

    it("when receiveItem is invoked using an non existing UPC then revert", async() => {
        await truffleAssert.reverts(sut.receiveItem(100), "UPC doesn't exist");
    })

    it("when receiveItem is invoked from a invalid previous state then revert", async() => {
        await sut.harvestItem(20, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})
        await truffleAssert.reverts(sut.receiveItem(20, {from: retailerID}), "Not in shipped state")
    })

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        await sut.addConsumer(consumerID)
        const itemUPC = 21
        await sut.harvestItem(itemUPC, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)
        await sut.processItem(itemUPC, {from: originFarmerID})
        await sut.packItem(itemUPC, {from: originFarmerID})
        await sut.sellItem(itemUPC, productPrice, {from: originFarmerID})
        await sut.buyItem(itemUPC, {from: distributorID, value: web3.utils.toWei("1", "ether")})
        await sut.shipItem(itemUPC, {from: distributorID})
        await sut.receiveItem(itemUPC, {from: retailerID})
        const txHash = await sut.purchaseItem(itemUPC, {from: consumerID})

        truffleAssert.eventEmitted(txHash, 'Purchased', (ev) => { return ev.upc == itemUPC })
        const item1 = await sut.fetchItemBufferOne(itemUPC)
        assert.equal(item1.ownerID, consumerID) 
        const item2 = await sut.fetchItemBufferTwo(itemUPC)
        assert.equal(item2.itemState, 7)         
        assert.equal(item2.consumerID, consumerID)  
    })   
    
    it("when purchaseItem is invoked by other role than consumer then revert", async() => {
        await truffleAssert.reverts(sut.purchaseItem(upc, {from: originFarmerID}), "Only consumers can do this action");
    })

    it("when purchaseItem is invoked using an non existing UPC then revert", async() => {
        await truffleAssert.reverts(sut.purchaseItem(100), "UPC doesn't exist");
    })

    it("when receiveItem is invoked from a invalid previous state then revert", async() => {
        await sut.harvestItem(22, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})
        await truffleAssert.reverts(sut.purchaseItem(22, {from: consumerID}), "Not in received state")
    })

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const result = await sut.fetchItemBufferOne.call(upc)
        assert.equal(result.itemSKU, sku)
        assert.equal(result.itemUPC, upc)
        assert.equal(result.ownerID, originFarmerID)
        assert.equal(result.originFarmerID, originFarmerID)
        assert.equal(result.originFarmName, originFarmName)
        assert.equal(result.originFarmInformation, originFarmInformation)
        assert.equal(result.originFarmLatitude, originFarmLatitude)
        assert.equal(result.originFarmLongitude, originFarmLongitude)
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const result = await sut.fetchItemBufferTwo.call(upc)
        
        assert.equal(result.itemSKU, sku)
        assert.equal(result.itemUPC, upc)
        assert.equal(result.productID, productID)
        assert.equal(result.productNotes, productNotes)
        assert.equal(result.productPrice, 0)
        assert.equal(result.itemState, 0)
        assert.equal(result.distributorID, 0)
        assert.equal(result.retailerID, 0)
        assert.equal(result.consumerID, 0)
    })
});

