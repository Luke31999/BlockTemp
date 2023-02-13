var Temperature = artifacts.require("./Temperature");

module.exports = function(deployer) {
  deployer.deploy(Temperature);
};