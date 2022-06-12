const express = require('express')
const app = express()
const port = 3000
import algosdk from "algosdk";
const Database = require("@replit/database")
var cors = require('cors')
import nearAPI from "near-api-js";


const db = new Database()

db.list().then(keys => keys.map((key) => db.delete(key)));

app.use(cors())
app.use(express.json());


const keyPair = nearAPI.KeyPair.fromString(process.env.NEAR_STRING)
const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
keyStore.setKey('testnet', 'aidan.testnet', keyPair);

const config = {
  keyStore, // instance of InMemoryKeyStore
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org'
};

// inside an async function
let near;




app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.post('/api/near', async (req, res) => {
  const body = req.body;
  const { address } = body;

  console.log(body)

  if (address == null) {
    res.send(400)
    return
  }
  
  if ((await db.get(address)) === true) {
    res.send({ "error": "already claimed" })
    return
  }

  if (!near) {
    near = await nearAPI.connect(config);
  }

  const account = await near.account("aidan.testnet");
  const resp = await account.sendMoney(
    address, // receiver account
    "1000" // amount in yoctoNEAR
  );

  console.log(resp.transaction_outcome)

  db.set(address, true)
  res.send({id: resp.transaction_outcome.id})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
