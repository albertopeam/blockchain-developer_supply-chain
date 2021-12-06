// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "../coffeecore/Ownable.sol";
import "../coffeeaccesscontrol/FarmerRole.sol";
import "../coffeeaccesscontrol/DistributorRole.sol";
import "../coffeeaccesscontrol/RetailerRole.sol";
import "../coffeeaccesscontrol/ConsumerRole.sol";

// Define a contract 'Supplychain'
contract SupplyChain is Ownable, FarmerRole, DistributorRole, RetailerRole, ConsumerRole {

  // Define a variable called 'upc' for Universal Product Code (UPC)
  uint  upc;

  // Define a variable called 'sku' for Stock Keeping Unit (SKU)
  uint  sku;

  // Define a public mapping 'items' that maps the UPC to an Item.
  mapping (uint => Item) items;

  // Define a public mapping 'itemsHistory' that maps the UPC to an array of TxHash, 
  // that track its journey through the supply chain -- to be sent from DApp.
  mapping (uint => string[]) itemsHistory;
  
  // Define enum 'State' with the following values:
  enum State 
  { 
    Harvested,  // 0
    Processed,  // 1
    Packed,     // 2
    ForSale,    // 3
    Sold,       // 4
    Shipped,    // 5
    Received,   // 6
    Purchased   // 7
    }

  State constant defaultState = State.Harvested;

  // Define a struct 'Item' with the following fields:
  struct Item {
    uint    sku;  // Stock Keeping Unit (SKU)
    uint    upc; // Universal Product Code (UPC), generated by the Farmer, goes on the package, can be verified by the Consumer
    address ownerID;  // Metamask-Ethereum address of the current owner as the product moves through 8 stages
    address originFarmerID; // Metamask-Ethereum address of the Farmer
    string  originFarmName; // Farmer Name
    string  originFarmInformation;  // Farmer Information
    string  originFarmLatitude; // Farm Latitude
    string  originFarmLongitude;  // Farm Longitude
    uint    productID;  // Product ID potentially a combination of upc + sku
    string  productNotes; // Product Notes
    uint    productPrice; // Product Price
    State   itemState;  // Product State as represented in the enum above
    address distributorID;  // Metamask-Ethereum address of the Distributor
    address retailerID; // Metamask-Ethereum address of the Retailer
    address consumerID; // Metamask-Ethereum address of the Consumer
    bool exists; // used to check existence
  }

  // Define 8 events with the same 8 state values and accept 'upc' as input argument
  event Harvested(uint upc);
  event Processed(uint upc);
  event Packed(uint upc);
  event ForSale(uint upc);
  event Sold(uint upc);
  event Shipped(uint upc);
  event Received(uint upc);
  event Purchased(uint upc);

  // Define a modifer that verifies the Caller
  modifier verifyCaller (address _address) {
    require(msg.sender == _address, "Caller can't do this action"); 
    _;
  }

  // Define a modifier that checks if the paid amount is sufficient to cover the price
  modifier paidEnough(uint _price) { 
    require(msg.value >= _price, "Not enough ether to pay"); 
    _;
  }
  
  // Define a modifier that checks the price and refunds the remaining balance
  modifier checkValue(uint _upc) {
    _;
    uint _price = items[_upc].productPrice;
    uint amountToReturn = msg.value - _price;
    payable(msg.sender).transfer(amountToReturn);
  }

  // Define a modifier that checks if an item.state of a upc is Harvested
  modifier harvested(uint _upc) {
    require(items[_upc].itemState == State.Harvested, "Not in harvested state");
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Processed
  modifier processed(uint _upc) {
    require(items[_upc].itemState == State.Processed, "Not in processed state");
    _;
  }
  
  // Define a modifier that checks if an item.state of a upc is Packed
  modifier packed(uint _upc) {
    require(items[_upc].itemState == State.Packed, "Not in packed state");
    _;
  }

  // Define a modifier that checks if an item.state of a upc is ForSale
  modifier forSale(uint _upc) {
    require(items[_upc].itemState == State.ForSale, "Not in for sale state");
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Sold
  modifier sold(uint _upc) {
    require(items[_upc].itemState == State.Sold, "Not in sold state");
    _;
  }
  
  // Define a modifier that checks if an item.state of a upc is Shipped
  modifier shipped(uint _upc) {
    require(items[_upc].itemState == State.Shipped, "Not in shipped state");
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Received
  modifier received(uint _upc) {

    _;
  }

  // Define a modifier that checks if an item.state of a upc is Purchased
  modifier purchased(uint _upc) {
    
    _;
  }

    // Define a modifier that checks if an item for an upc exists
  modifier exists(uint _upc) {
    require(items[_upc].exists == true, "UPC doesn't exist");
    _;
  }

  // and set 'sku' to 1
  // and set 'upc' to 1
  constructor() payable {
    sku = 1;
    upc = 1;
  }

  // Define a function 'kill' if required
  function kill() public onlyOwner {
    selfdestruct(payable(owner()));
  }

  // Define a function 'harvestItem' that allows a farmer to mark an item 'Harvested'
  function harvestItem(uint _upc, address _originFarmerID, string memory _originFarmName, string memory _originFarmInformation, string  memory _originFarmLatitude, string memory _originFarmLongitude, string memory _productNotes) public 
    onlyFarmer
  {
    require(items[_upc].exists == false, "UPC already exists");
    // Add the new item as part of Harvest
    items[_upc] = Item({
      sku: sku, 
      upc: _upc, 
      ownerID: _originFarmerID, 
      originFarmerID: _originFarmerID, 
      originFarmName: _originFarmName,
      originFarmInformation: _originFarmInformation, 
      originFarmLatitude: _originFarmLatitude,
      originFarmLongitude: _originFarmLongitude,
      productID: sku + _upc,
      productNotes: _productNotes,
      productPrice: 0,
      itemState: defaultState,
      distributorID: address(0),
      retailerID: address(0),
      consumerID: address(0),
      exists: true
      });
    // Increment sku
    sku = sku + 1;
    // Emit the appropriate event
    uint some = _upc;
    emit Harvested(some);
  }

  // Define a function 'processtItem' that allows a farmer to mark an item 'Processed'
  function processItem(uint _upc) public 
    onlyFarmer  
    exists(_upc)
    verifyCaller(items[_upc].originFarmerID)
    harvested(_upc)
  {
    items[_upc].itemState = State.Processed;
    emit Processed(_upc);
  }

  // Define a function 'packItem' that allows a farmer to mark an item 'Packed'
  function packItem(uint _upc) public 
    onlyFarmer
    exists(_upc)
    verifyCaller(items[_upc].originFarmerID)
    processed(_upc)
  {
    items[_upc].itemState = State.Packed;
    emit Packed(_upc);
  }

  // Define a function 'sellItem' that allows a farmer to mark an item 'ForSale'
  function sellItem(uint _upc, uint _price) public 
    onlyFarmer
    exists(_upc)
    verifyCaller(items[_upc].originFarmerID)
    packed(_upc)
  {
    items[_upc].itemState = State.ForSale;
    items[_upc].productPrice = _price;
    emit ForSale(_upc);
  }

  // Define a function 'buyItem' that allows the distributor to mark an item 'Sold'
  // Use the above defined modifiers to check if the item is available for sale, if the buyer has paid enough, 
  // and any excess ether sent is refunded back to the buyer
  function buyItem(uint _upc) public payable 
    onlyDistributor
    exists(_upc)
    forSale(_upc)    
    paidEnough(items[_upc].productPrice)
    checkValue(_upc)
    {
      address previousOwnerID = items[_upc].ownerID;
      uint price = items[_upc].productPrice;
      items[_upc].itemState = State.Sold;
      items[_upc].ownerID = msg.sender;
      items[_upc].distributorID = msg.sender;      
      payable(previousOwnerID).transfer(price);
      emit Sold(_upc);
  }

  // Define a function 'shipItem' that allows the distributor to mark an item 'Shipped'
  // Use the above modifers to check if the item is sold
  function shipItem(uint _upc) public 
    onlyDistributor
    exists(_upc)
    sold(_upc)
    verifyCaller(items[_upc].distributorID)
    {
      items[_upc].itemState = State.Shipped;
      emit Shipped(_upc);
  }

  // Define a function 'receiveItem' that allows the retailer to mark an item 'Received'
  // Use the above modifiers to check if the item is shipped
  function receiveItem(uint _upc) public 
    onlyRetailer
    exists(_upc)
    shipped(_upc)
    {
    // Update the appropriate fields - ownerID, retailerID, itemState
    
    // Emit the appropriate event
    items[_upc].itemState = State.Received;
    items[_upc].ownerID = msg.sender;
    items[_upc].retailerID = msg.sender;
    emit Received(_upc);
  }

  // Define a function 'purchaseItem' that allows the consumer to mark an item 'Purchased'
  // Use the above modifiers to check if the item is received
  function purchaseItem(uint _upc) public 
    // Call modifier to check if upc has passed previous supply chain stage
    
    // Access Control List enforced by calling Smart Contract / DApp
    {
    // Update the appropriate fields - ownerID, consumerID, itemState
    
    // Emit the appropriate event
    
  }

  // Define a function 'fetchItemBufferOne' that fetches the data
  function fetchItemBufferOne(uint _upc) public view returns 
    (
    uint    itemSKU,
    uint    itemUPC,
    address ownerID,
    address originFarmerID,
    string  memory originFarmName,
    string  memory originFarmInformation,
    string  memory originFarmLatitude,
    string  memory originFarmLongitude
    ) 
  {
    // Assign values to the 8 parameters
    Item memory item = items[_upc];
    itemSKU = item.sku;
    itemUPC = item.upc;
    ownerID = item.ownerID;
    originFarmerID = item.originFarmerID;
    originFarmName = item.originFarmName;
    originFarmInformation = item.originFarmInformation;
    originFarmLatitude = item.originFarmLatitude;
    originFarmLongitude = item.originFarmLongitude;
    return
    (
    itemSKU,
    itemUPC,
    ownerID,
    originFarmerID,
    originFarmName,
    originFarmInformation,
    originFarmLatitude,
    originFarmLongitude
    );
  }

  // Define a function 'fetchItemBufferTwo' that fetches the data
  function fetchItemBufferTwo(uint _upc) public view returns 
  (
  uint    itemSKU,
  uint    itemUPC,
  uint    productID,
  string  memory productNotes,
  uint    productPrice,
  uint    itemState,
  address distributorID,
  address retailerID,
  address consumerID
  ) 
  {
    // Assign values to the 9 parameters
    Item memory item = items[_upc];
    itemSKU = item.sku;
    itemUPC = item.upc;
    productID = item.productID;
    productNotes = item.productNotes;
    productPrice = item.productPrice;
    if (item.itemState == State.Harvested) {
      itemState = 0;
    } else if (item.itemState == State.Processed) {
      itemState = 1;
    } else if (item.itemState == State.Packed) {
      itemState = 2;
    } else if (item.itemState == State.ForSale) {
      itemState = 3;
    } else if (item.itemState == State.Sold) {
      itemState = 4;
    } else if (item.itemState == State.Shipped) {
      itemState = 5;
    } else if (item.itemState == State.Received) {
      itemState = 6;
    } else if (item.itemState == State.Purchased) {
      itemState = 7;
    }
    distributorID = item.distributorID;
    retailerID = item.retailerID;
    consumerID = item.consumerID;
    return 
    (
    itemSKU,
    itemUPC,
    productID,
    productNotes,
    productPrice,
    itemState,
    distributorID,
    retailerID,
    consumerID
    );
  }
}
