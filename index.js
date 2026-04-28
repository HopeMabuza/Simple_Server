require('dotenv').config()
const express = require('express')
const app = express()


//ethers imports
const {JsonRpcProvider, formatEther} = require('ethers')
const provider = new JsonRpcProvider(process.env.INFURA_RPC_URL)


app.get('/', (req, res) => {
    res.json({message: "We are in the root, the server is running"})
})

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from your server' })
})


//get your balance from the blockchain
//we use async because we have to wait since we are getting data from outside 
//in this case, Infura
const walletAddress = process.env.WALLET_ADDRESS

app.get('/api/balance/', async (req,res) => {
    const balance = await provider.getBalance(walletAddress)
    res.json({eth: formatEther(balance)})
})

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000")
})