var GreenToken = artifacts.require("GreenToken");

module.exports = function(deployer) {
  deployer.deploy(GreenToken);
};
