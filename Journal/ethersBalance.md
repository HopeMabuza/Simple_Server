# Reading an ERC-20 Balance with ethers.js

By the end of this guide you will have a live Express endpoint that connects to the Sepolia testnet, reads a real ERC-20 token balance from a wallet address, and returns it as clean JSON.

We use Sepolia instead of mainnet so you can test with real blockchain calls without spending real ETH.

---

## What you are building

A URL that looks like this:

```
http://localhost:3000/api/balance/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

Where the address at the end is any wallet. The server connects to Sepolia, reads that wallet's LINK balance, and returns:

```json
{
  "wallet": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "network": "sepolia",
  "token": "LINK",
  "balance": "25.0"
}
```

---

## Before you start

Make sure you have:

- Completed the `setUp.md` exercise — your server runs and returns JSON
- An Alchemy account with an API key — get one free at [alchemy.com](https://www.alchemy.com)
- `ethers` and `dotenv` already in your `package.json` — you do

---

## Project structure

```
my-server/
├── node_modules/
├── .env          ← your secret Alchemy key goes here
├── package.json
└── index.js      ← your server
```

---

## Step 1 — Add your Alchemy key to .env

Create a file called `.env` in your project folder:

```
ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/your_key_here
```

Replace `your_key_here` with your actual Alchemy API key.

Then make sure `.env` is in your `.gitignore` so it never gets pushed to GitHub:

```
# .gitignore
.env
```

> **Why?** Your Alchemy key is like a password. If it ends up in GitHub anyone can use it and drain your free credits.

---

## Step 2 — Write the endpoint

Replace everything in `index.js` with this:

```js
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
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL)

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
```

---

## Step 3 — Understand what you just wrote

### The ABI — just a description of the contract

```js
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
]
```

You are not writing a contract — you are telling ethers.js what functions exist on it so it knows how to call them. Think of the ABI as a menu: it lists what you can order, not how the kitchen makes it.

For standard contracts like ERC-20 you only need to list the functions you actually use. You do not need the full ABI.

### The provider — your connection to the blockchain

```js
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL)
```

This is how your server talks to Ethereum. Alchemy is the middleman — they run the node, you just send requests through their URL. By using `eth-sepolia` in the URL you are pointing at the Sepolia testnet instead of mainnet. Your key is loaded from `.env` so it never appears in your code.

### Reading from the contract

```js
const [rawBalance, decimals, symbol] = await Promise.all([
  contract.balanceOf(address),
  contract.decimals(),
  contract.symbol()
])
```

Three things to know here:

- These are `view` functions — read-only calls that cost **zero gas**. Your server can call them freely as many times as it needs.
- `Promise.all` fires all three calls at the same time instead of one after another — faster response.
- `await` is needed because talking to the blockchain is async — it takes a moment to get a response back.

### Formatting the raw balance

```js
const formatted = ethers.formatUnits(rawBalance, decimals)
```

The blockchain stores balances as giant integers with no decimal point. `rawBalance` for 1 USDC actually comes back as `1000000` because USDC has 6 decimals. `formatUnits` divides it correctly and gives you `"1.0"` — the number a human expects to see.

| Raw value from chain | Decimals | What formatUnits returns |
|---|---|---|
| `1000000` | 6 | `"1.0"` |
| `1500000` | 6 | `"1.5"` |
| `1000000000000000000` | 18 | `"1.0"` |

### Error handling

```js
try {
  ...
} catch (err) {
  res.status(500).json({ error: err.message })
}
```

If an invalid address is passed or the RPC call fails, the server returns a clean error message instead of crashing. Always wrap blockchain calls in try/catch.

---

## Step 4 — Run and test it

Start your server:

```bash
node index.js
```

Test it in your browser or terminal with your own wallet address:

```bash
curl http://localhost:3000/api/balance/your_wallet_address
```

You should get back:

```json
{
  "wallet": "0xYourAddress",
  "network": "sepolia",
  "token": "LINK",
  "balance": "25.0"
}
```

If your balance shows `"0.0"` your wallet just has no Sepolia LINK yet — see Task 1 in the exercise below to fix that.

---

## Mini Exercise — Extend the endpoint

Now that the base endpoint works, complete these tasks one at a time to solidify your understanding.

### Task 1 — Get testnet LINK and check your balance

Your wallet probably has zero Sepolia LINK right now. Grab some free testnet LINK from the Chainlink faucet:

1. Go to `faucets.chain.link`
2. Connect your wallet and select Sepolia
3. Request LINK — it arrives in about 30 seconds

Then hit your endpoint with your wallet address and confirm the balance comes back.

### Task 2 — Add Sepolia ETH balance alongside the token balance

ethers.js can also fetch the native ETH balance using the provider directly — no contract or ABI needed:

```js
const ethBalance = await provider.getBalance(address)
const formattedEth = ethers.formatEther(ethBalance)
```

Add this inside your route and include `eth: formattedEth` in the response:

```json
{
  "wallet": "0xYourAddress",
  "network": "sepolia",
  "token": "LINK",
  "balance": "25.0",
  "eth": "0.5"
}
```

You can get free Sepolia ETH from `sepoliafaucet.com` if your wallet needs it.

### Task 3 — Switching back to mainnet

When you are ready to point at mainnet instead of Sepolia, only two things change:

```
# .env
ALCHEMY_URL=https://eth-mainnet.g.alchemy.com/v2/your_key_here
```

```js
// index.js — swap to a mainnet token address e.g. USDC
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const contract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider)
```

Restart your server and everything else — the route, ABI, formatting — works identically on mainnet.

### Task 4 — Test the invalid address guard

Call your endpoint with a made-up address:

```bash
curl http://localhost:3000/api/balance/0xINVALID
```

You should get back a clean `400` error:

```json
{ "error": "Invalid wallet address" }
```

This comes from the `ethers.isAddress()` check already in the code. If you removed it accidentally, add it back at the top of your route:

```js
if (!ethers.isAddress(address)) {
  return res.status(400).json({ error: 'Invalid wallet address' })
}
```

---

## The pattern to remember

When you want to use your own token contract instead of LINK, just swap two things:

```js
const YOUR_TOKEN_ADDRESS = '0xYourContractAddressHere'
const contract = new ethers.Contract(YOUR_TOKEN_ADDRESS, ERC20_ABI, provider)
```

And when switching networks, just update your `.env`:

```
# Sepolia testnet
ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/your_key_here

# Mainnet (when you are ready to go live)
ALCHEMY_URL=https://eth-mainnet.g.alchemy.com/v2/your_key_here
```

Everything else — the route, the ABI, the formatting, the error handling — stays exactly the same regardless of network or token.