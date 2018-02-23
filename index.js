var INFURA_MAINNET_URL = 'https://mainnet.infura.io/gmXEVo5luMPUGPqg6mhy';

var Web3 = require('web3')

var web3Utils = require('web3-utils')
const Tx = require('ethereumjs-tx')


var callerAccount = require('./callerAccount').account;


var tokenContractJSON = require('./contracts/_0xBitcoinToken.json');

var deploymentData = require('./contracts/DeployedContractInfo.json');


var contractAddress = deploymentData.networks.mainnet.contracts._0xbitcointoken.blockchain_address;


var AMT = 320000000000 ;

init();


//transfer out tokens from donations 
async function init(){

  this.web3 = new Web3( );
  this.web3.setProvider(INFURA_MAINNET_URL);


  console.log(callerAccount)


  this.tokenContract =  new this.web3.eth.Contract(tokenContractJSON.abi,contractAddress)

  //var tokenName = await this.tokenContract.methods.name().call()



    console.log(AMT)
  var mintMethod = this.tokenContract.methods.transferAnyERC20Token('0xB6eD7644C69416d67B522e20bC294A9a9B405B31', AMT);


  var txData = this.web3.eth.abi.encodeFunctionCall({
          name: 'transferAnyERC20Token',
          type: 'function',
          inputs: [{
              type: 'address',
              name: 'tokenAddress'
          },{
              type: 'uint256',
              name: 'tokens'
          }]
      }, ['0xB6eD7644C69416d67B522e20bC294A9a9B405B31', AMT]);


  var max_gas_cost = 1704624;


    var addressTo = this.tokenContract.options.address;
    var addressFrom = callerAccount.address


  var txCount = await this.web3.eth.getTransactionCount(addressFrom);

  console.log('est gas')
  var estimatedGasCost = await mintMethod.estimateGas({gas: max_gas_cost, from:addressFrom, to: addressTo });


  if( estimatedGasCost > max_gas_cost){
    console.log("Gas estimate too high!  Something went wrong ")
    return;
  }

  console.log('estimatedGasCost',(estimatedGasCost))


  console.log('wei' ,  web3Utils.toWei('1', 'gwei')  )


  const txOptions = {
    nonce: web3Utils.toHex(txCount),
    gas: (estimatedGasCost),   //?
    gasPrice:  1000000000, //web3Utils.toWei('1', 'gwei')  ,
    value: 0,
    to: addressTo,
    from: addressFrom,
    data: txData
  }



  return new Promise(function (result,error) {

       sendSignedRawTransaction(this.web3,txOptions,addressFrom,callerAccount.privateKey, function(err, res) {
        if (err) error(err)
          result(res)
      })

    }.bind(this));


}


  async function sendSignedRawTransaction(web3,txOptions,addressFrom,fullPrivKey,callback) {



    var privKey = truncate0xFromString( fullPrivKey )

    const privateKey = new Buffer( privKey, 'hex')
    const transaction = new Tx(txOptions)


    transaction.sign(privateKey)


    const serializedTx = transaction.serialize().toString('hex')

      try
      {
        var result =  web3.eth.sendSignedTransaction('0x' + serializedTx, callback)
      }catch(e)
      {
        console.log(e);
      }
  }

    function  truncate0xFromString(s)
    {
      if(s.startsWith('0x')){
        return s.substring(2);
      }
      return s;
    }
