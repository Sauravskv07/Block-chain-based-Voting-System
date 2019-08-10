const Vote_Token = artifacts.require("./Vote_Token.sol");

module.exports = function(deployer) {
  deployer.deploy(Vote_Token,"General Election 2019 Vote Token");
};
