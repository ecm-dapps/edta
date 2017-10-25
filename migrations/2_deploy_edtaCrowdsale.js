var edtaCrowdsale = artifacts.require("./edtaCrowdsale.sol");

module.exports = function(deployer, network, accounts) {
  const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 10 // ten second in the future
  const endTime = startTime + (86400 * 30) // 30 days
  const rate = new web3.BigNumber(1000)
  const wallet = accounts[0]

  deployer.deploy(edtaCrowdsale, startTime, endTime, rate, wallet)
};
