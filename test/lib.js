// Practice minting, distributing, and burning
const Web3 = require("web3");
const ethereumTx = require("ethereumjs-tx");
const ethereumUtil = require("ethereumjs-util");
const abi = require("./config/abi");
const config = require("./config/contract.ropsten.json");
const BigNumber = require("bignumber.js");

const web3 = new Web3(config.url);

async function getTokenTransactions(
  contractAddress,
  accountAddress,
  decimalPlaces
) {
  let currentBlockNumber, contract, transferEvents;

  try {
    currentBlockNumber = await web3.eth.getBlockNumber();
  } catch (err) {
    throw err;
  }
  try {
    contract = new web3.eth.Contract(abi, contractAddress);
  } catch (err) {
    throw err;
  }
  try {
    transferEvents = await contract.getPastEvents("allEvents", {
      fromBlock: 2426642
    });
  } catch (err) {
    throw err;
  }

  const transferObjects = transferEvents
    .filter(
      ({ returnValues }) =>
        returnValues._to === accountAddress ||
        returnValues._from === accountAddress
    )
    .sort((evOne, evTwo) => evOne.blockNumber < evTwo.blockNumber)
    .map(async ({ blockNumber, transactionHash, returnValues, blockHash }) => {
      let timestamp = "";

      try {
        await web3.eth.getBlock(blockNumber, false, (err, res) => {
          if (err) {
            throw err;
          }
          try {
            timestamp = res.timestamp;
          } catch (err) {
            throw err;
          }
        });
      } catch (err) {
        throw err;
      }
      return {
        timestamp,
        transactionHash,
        confirmations: currentBlockNumber - blockNumber,
        amount: returnValues._value * Math.pow(10, decimalPlaces * -1),
        status: blockHash ? "success" : "failed",
        blockNumber,
        type: returnValues._to === accountAddress ? "deposit" : "withdrawal",
        to: returnValues._to,
        from: returnValues._from
      };
    });

  return Promise.all(transferObjects)
    .then(results => {
      return results;
    })
    .catch(err => {
      throw new Error(err);
    });
}

async function getBalance(contractAddress, accountAddress, decimalPlaces) {
  const contract = new web3.eth.Contract(abi, contractAddress);
  let balance;

  try {
    balance = await contract.methods.balanceOf(accountAddress).call();
  } catch (err) {
    throw err;
  }

  return formatBalance(balance, decimalPlaces);
}

async function sendTransaction(
  accountAddress,
  privateKey,
  contractAddress,
  contract
) {
  let count, signedTransaction;

  try {
    count = await web3.eth.getTransactionCount(accountAddress);
  } catch (err) {
    throw err;
  }

  const rawTransaction = {
    from: accountAddress,
    nonce: "0x" + count.toString(16),
    gasPrice: "0x003B9ACA00",
    gasLimit: 4000000,
    to: contractAddress,
    value: "0x0",
    data: contract
  };

  const privKey = ethereumUtil.toBuffer(`0x${privateKey}`);
  const tx = new ethereumTx(rawTransaction);

  tx.sign(privKey);
  const serializedTx = tx.serialize();

  try {
    signedTransaction = await web3.eth.sendSignedTransaction(
      "0x" + serializedTx.toString("hex")
    );
  } catch (err) {
    throw err;
  }

  return signedTransaction;
}

async function sendToken(
  toAddress,
  accountAddress,
  value,
  privateKey,
  contractAddress,
  decimalPlaces
) {
  const sendValue = value * Math.pow(10, decimalPlaces);
  let count, signedTransaction;

  try {
    count = await web3.eth.getTransactionCount(accountAddress);
  } catch (err) {
    throw err;
  }

  const contract = new web3.eth.Contract(abi, contractAddress, {
    from: accountAddress
  });

  const rawTransaction = {
    from: accountAddress,
    nonce: "0x" + count.toString(16),
    gasPrice: "0x003B9ACA00",
    gasLimit: "0x250CA",
    to: contractAddress,
    value: "0x0",
    data: contract.methods.transfer(toAddress, sendValue).encodeABI()
  };

  const privKey = ethereumUtil.toBuffer(`0x${privateKey}`); // Buffer not correct?
  const tx = new ethereumTx(rawTransaction);

  tx.sign(privKey);
  const serializedTx = tx.serialize();
  try {
    signedTransaction = await web3.eth.sendSignedTransaction(
      "0x" + serializedTx.toString("hex")
    );
  } catch (err) {
    throw err;
  }

  return signedTransaction;
}

async function mintTokens(
  toAddress,
  accountAddress,
  value,
  privateKey,
  contractAddress,
  decimalPlaces
) {
  const sendValue = value * Math.pow(10, decimalPlaces);
  const contract = new web3.eth.Contract(abi, contractAddress, {
    from: accountAddress
  });
  const contractMethod = contract.methods
    .mint(toAddress, sendValue)
    .encodeABI();
  let mint;

  try {
    mint = await sendTransaction(
      accountAddress,
      privateKey,
      contractAddress,
      contractMethod
    );
  } catch (err) {
    throw err;
  }

  return mint;
}

async function distributeTokens(
  distAddresses,
  distValues,
  accountAddress,
  privateKey,
  contractAddress,
  decimalPlaces
) {
  const formattedDistValues = distValues.map(value => {
    return new BigNumber(value * Math.pow(10, decimalPlaces));
  });

  const contract = new web3.eth.Contract(abi, contractAddress, {
    from: accountAddress
  });

  const contractMethod = contract.methods
    .distributeMinting(distAddresses, formattedDistValues)
    .encodeABI();

  let distributeMinting;

  try {
    distributeMinting = await sendTransaction(
      accountAddress,
      privateKey,
      contractAddress,
      contractMethod
    );
  } catch (err) {
    throw err;
  }

  return distributeMinting;
}

async function burnTokens(
  accountAddress,
  value,
  privateKey,
  contractAddress,
  decimalPlaces
) {
  const burnValue = value * Math.pow(10, decimalPlaces);
  const contract = new web3.eth.Contract(abi, contractAddress, {
    from: accountAddress
  });
  const contractMethod = contract.methods.burn(burnValue).encodeABI();
  let burn;

  try {
    burn = await sendTransaction(
      accountAddress,
      privateKey,
      contractAddress,
      contractMethod
    );
  } catch (err) {
    throw err;
  }

  return burn;
}

function formatBalance(num, decimalPlaces) {
  const numArray = num.split("");
  numArray.splice(numArray.length - decimalPlaces, 0, ".");
  return numArray.join("");
}

module.exports = {
  getTokenTransactions,
  getBalance,
  sendToken,
  mintTokens,
  distributeTokens,
  burnTokens
};
