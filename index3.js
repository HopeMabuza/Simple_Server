require('dotenv').config()
const express = require('express')
const { ethers } = require('ethers')

const app = express()

// ERC-20 ABI — only the functions we need
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
]

// LINK token on Sepolia testnet
const LINK_ADDRESS = '0x779877A7B0D9E8603169DdbD7836e478b4624789'

// Connect to Sepolia via Alchemy
const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC_URL)

app.get('/api/balance/:address', async (req, res) => {
  try {
    const { address } = req.params

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid wallet address' })
    }

    // Connect to the LINK contract on Sepolia
    const contract = new ethers.Contract(LINK_ADDRESS, ERC20_ABI, provider)

    // Read from the contract — free, no gas needed
    const [rawBalance, decimals, symbol] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
      contract.symbol()
    ])

    // Format the raw number into something human readable
    const formatted = ethers.formatUnits(rawBalance, decimals)

    res.json({
      wallet: address,
      network: 'sepolia',
      token: symbol,
      balance: formatted
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000, () => console.log('Running on http://localhost:3000'))