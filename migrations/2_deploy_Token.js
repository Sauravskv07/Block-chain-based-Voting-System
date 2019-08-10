const VoteToken = artifacts.require("Vote_Token");

module.exports = function(deployer) {
  deployer.deploy(VoteToken);
};
