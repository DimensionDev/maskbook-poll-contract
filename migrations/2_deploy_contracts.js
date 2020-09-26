var PollContract = artifacts.require('./PollContract.sol')
module.exports = function (deployer) {
  deployer.deploy(PollContract);
};