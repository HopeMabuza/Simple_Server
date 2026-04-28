# Reading an ERC-20 Balance with ethers.js

By the end of this guide you will have a live Express endpoint that connects to the Ethereum blockchain, reads a real ERC-20 token balance from a wallet address, and returns it as clean JSON.

---

## What you are building

A URL that looks like this:

```
http://localhost:3000/api/balance/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

Where the address at the end is any wallet. The server connects to the blockchain, reads that wallet's USDC balance, and returns:

```json
{
  "wallet": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "token": "USDC",
  "balance": "420.50"
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
ALCHEMY_URL=https://eth-mainnet.g.alchemy.com/v2/your_key_here
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

// USDC contract address on Ethereum mainnet
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

// Connect to Ethereum via Alchemy
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL)

app.get('/api/balance/:address', async (req, res) => {
  try {
    const { address } = req.params

    // Connect to the USDC contract
    const contract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider)

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

This is how your server talks to Ethereum. Alchemy is the middleman — they run the node, you just send requests through their URL. Your key is loaded from `.env` so it never appears in your code.

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

Test it in your browser or terminal with a known wallet address:

```bash
curl http://localhost:3000/api/balance/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

You should get back:

```json
{
  "wallet": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "token": "USDC",
  "balance": "420.50"
}
```

---

## Mini Exercise — Extend the endpoint

Now that the base endpoint works, complete these tasks one at a time to solidify your understanding.

### Task 1 — Check your own wallet

Replace the address in the URL with your own wallet address and confirm your real USDC balance comes back. You can verify it against what Etherscan shows at `etherscan.io/address/your_address`.

### Task 2 — Add ETH balance alongside the token balance

ethers.js can also fetch the native ETH balance using the provider directly — no contract or ABI needed:

```js
const ethBalance = await provider.getBalance(address)
const formattedEth = ethers.formatEther(ethBalance)
```

Add this inside your route and include `eth: formattedEth` in the response:

```json
{
  "wallet": "0xd8dA6...",
  "token": "USDC",
  "balance": "420.50",
  "eth": "1.25"
}
```

### Task 3 — Read a different ERC-20 token

Swap `USDC_ADDRESS` for the USDT contract address on mainnet:

```
0xdAC17F958D2ee523a2206206994597C13D831ec7
```

Restart your server and call the same endpoint. The `symbol` field in the response should now say `"USDT"` instead of `"USDC"` — same code, different contract.

### Task 4 — Handle an invalid address

Call your endpoint with a made-up address:

```bash
curl http://localhost:3000/api/balance/0xINVALID
```

You should get back a `500` error response from your try/catch. Now add a validation check at the top of your route before the contract call:

```js
if (!ethers.isAddress(address)) {
  return res.status(400).json({ error: 'Invalid wallet address' })
}
```

This returns a `400` (bad request) instead of a `500` (server error) — more accurate and easier to debug from the frontend.

---

## The pattern to remember

When you want to use your own token contract instead of USDC, just swap two things:

```js
const YOUR_TOKEN_ADDRESS = '0xYourContractAddressHere'
const contract = new ethers.Contract(YOUR_TOKEN_ADDRESS, ERC20_ABI, provider)
```

Everything else — the route, the formatting, the error handling — stays exactly the same.