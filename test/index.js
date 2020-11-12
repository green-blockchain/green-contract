const web3 = require("./lib.js");
const config = require("./config/contract.ropsten.json");

const contractAddress = config.contractAddress;
const accountAddress = config.accountAddress;
const privateKey = config.privateKey;
const secondaryAddress = config.secondaryAddress;
const secondaryPK = config.secondaryPK;
const toAddress = config.toAddress;
const distAddresses = config.distAddresses;
const distValues = config.distValues;
const decimalPlaces = config.decimalPlaces;

(async function() {
  const balance = await web3.getBalance(
    contractAddress,
    toAddress,
    decimalPlaces
  );
  console.log("balance: ", balance);

  // const toBalance = await web3.getBalance(
  //   contractAddress,
  //   toAddress,
  //   decimalPlaces
  // );
  // console.log("to balance: ", toBalance);

  // const mint = await web3.mintTokens(
  //   secondaryAddress,
  //   accountAddress,
  //   2,
  //   privateKey,
  //   contractAddress,
  //   decimalPlaces
  // );
  // console.log("mint:", mint);

  const distribute = await web3.distributeTokens(
    distAddresses,
    distValues,
    accountAddress,
    privateKey,
    contractAddress,
    decimalPlaces
  );
  console.log("distribute:", distribute);

  // const burn = await web3.burnTokens(
  //   secondaryAddress,
  //   1,
  //   secondaryPK,
  //   contractAddress,
  //   decimalPlaces
  // );
  // console.log("burn:", burn);

  // const secondaryBalance = await web3.getBalance(
  //   contractAddress,
  //   secondaryAddress,
  //   decimalPlaces
  // );
  // console.log("to balance: ", secondaryBalance);

  const balance1 = await web3.getBalance(
    contractAddress,
    toAddress,
    decimalPlaces
  );
  console.log("balance: ", balance1);
})();
