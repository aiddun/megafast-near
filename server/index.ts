const express = require('express')
const app = express()
const port = 3000
import algosdk from "algosdk";
const Database = require("@replit/database")
var cors = require('cors')


const db = new Database()

db.list().then(keys => keys.map((key) => db.delete(key)));

app.use(cors())
app.use(express.json());


const token = {
    'X-API-Key': process.env.APIKEY
}
const algodServer = "https://testnet-algorand.api.purestake.io/ps2";
const aport = '';


const algodClient = new algosdk.Algodv2(token, algodServer, aport);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/api/tap', async (req, res) => {
  const body = req.body;
  const { address } = body;

  if ((await db.get(address)) === true) 
  {
    res.send({ "error": "already claimed" })
    return
  } 

  let params = await algodClient.getTransactionParams().do();
  // comment out the next two lines to use suggested fee
  params.fee = 1000;
  params.flatFee = true;

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: "YCVKCMTPENADSHKA3I24SPDRT5JHLYAUZZ36W22J3K7OR62FDWPOBXQDUY",
    to: address,
    amount: 1,
    suggestedParams: params
  });


  let account = algosdk.mnemonicToSecretKey(process.env.PHRASE);
  let signedTxn = txn.signTxn(account.sk);

  // send signed transaction to node
  let tx = await algodClient.sendRawTransaction(signedTxn).do();
  console.log("Signed transaction with txID: %s", tx.txId);
  // Wait for confirmation
  let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
  //Get the completed Transaction
  console.log("Transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
  let mytxinfo = JSON.stringify(confirmedTxn.txn.txn, undefined, 2);
  console.log("Transaction information: %o", mytxinfo);
  var string = new TextDecoder().decode(confirmedTxn.txn.txn.note);
  console.log("Note field: ", string);

  db.set(address, true)

  res.send({ txid: tx.txId })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
