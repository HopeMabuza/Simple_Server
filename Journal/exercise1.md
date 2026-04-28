# Exercise — Your First Route with a URL Parameter

By the end of this exercise you will have a running Express route that accepts a wallet address in the URL and returns NFT data as JSON.

No blockchain connection yet — just Express doing its job. That's the point. Get comfortable with how routes and parameters work before adding complexity.

---

## What you are building

A URL that looks like this:

```
http://localhost:3000/api/nfts/0xABC123
```

Where `0xABC123` is any wallet address. The server reads it from the URL and sends back NFT data that belongs to that wallet.

---

## Before you start

Make sure you have done the setUp exercise first. You should already have:

```
my-server/
├── node_modules/
├── package.json
└── index.js
```

If not, go back to `setUp.md` and follow those steps first.

---

## Step 1 — Understand the URL structure

Look at this URL:

```
http://localhost:3000/api/nfts/0xABC123
```

Break it into parts:

| Part | What it is |
|---|---|
| `http://localhost:3000` | Your server address while developing locally |
| `/api/nfts/` | The fixed part of the route — never changes |
| `0xABC123` | The variable part — this is the wallet address |

The wallet address at the end is what Express calls a **URL parameter**. It changes with every request depending on which wallet you ask about.

---

## Step 2 — Write the route

Open your `index.js` and replace everything with this:

```js
const express = require('express')
const app = express()

app.get('/api/nfts/:address', (req, res) => {
  const { address } = req.params

  const mockNFTs = [
    {
      tokenId: '1',
      name: 'Cool Ape #1',
      owner: address,
      image: 'https://example.com/nft1.png',
      attributes: [{ trait: 'Background', value: 'Blue' }]
    },
    {
      tokenId: '2',
      name: 'Cool Ape #2',
      owner: address,
      image: 'https://example.com/nft2.png',
      attributes: [{ trait: 'Background', value: 'Red' }]
    }
  ]

  res.json({ wallet: address, nfts: mockNFTs })
})

app.listen(3000, () => console.log('Running on http://localhost:3000'))
```

---

## Step 3 — Understand what you just wrote

Go line by line:

**The route definition:**
```js
app.get('/api/nfts/:address', (req, res) => {
```
- `app.get` — this route responds to GET requests (reading data)
- `'/api/nfts/:address'` — the URL pattern. The `:address` part means "treat whatever comes here as a variable called `address`"
- `(req, res)` — two objects Express gives you automatically:
  - `req` — the incoming request (contains the URL, params, body, etc.)
  - `res` — your response (what you send back)

**Grabbing the wallet address:**
```js
const { address } = req.params
```
- `req.params` holds all the URL variables you defined with `:`
- If the URL was `/api/nfts/0xABC123` then `req.params.address` equals `"0xABC123"`
- `const { address } = req.params` is shorthand for `const address = req.params.address`

**The mock data:**
```js
const mockNFTs = [...]
```
- Just a plain JavaScript array of objects pretending to be real NFT data
- Notice `owner: address` — the wallet from the URL is being used inside the data
- In a real dApp this array would come from your contract or database instead

**Sending the response:**
```js
res.json({ wallet: address, nfts: mockNFTs })
```
- `res.json(...)` sends the data back as JSON
- You are sending back an object with two fields: the wallet address and its NFTs

**Starting the server:**
```js
app.listen(3000, () => console.log('Running on http://localhost:3000'))
```
- Tells Express to start listening for requests on port 3000
- The message prints in your terminal so you know it worked

---

## Step 4 — Run the server

In your terminal:

```bash
node index.js
```

You should see:

```
Running on http://localhost:3000
```

If you see an error, the most common causes are:
- You are not inside the `my-server` folder — run `cd my-server` first
- You have a typo in `index.js` — check every bracket and comma

---

## Step 5 — Test it

Open your browser and go to:

```
http://localhost:3000/api/nfts/0xABC123
```

You should see this JSON in the browser:

```json
{
  "wallet": "0xABC123",
  "nfts": [
    {
      "tokenId": "1",
      "name": "Cool Ape #1",
      "owner": "0xABC123",
      "image": "https://example.com/nft1.png",
      "attributes": [{ "trait": "Background", "value": "Blue" }]
    },
    {
      "tokenId": "2",
      "name": "Cool Ape #2",
      "owner": "0xABC123",
      "image": "https://example.com/nft2.png",
      "attributes": [{ "trait": "Background", "value": "Red" }]
    }
  ]
}
```

---

## Step 6 — Try a different wallet address

Now change the wallet address in the URL:

```
http://localhost:3000/api/nfts/0xDEF456
```

Notice the response updates — `wallet` and every `owner` field now shows `0xDEF456`. You did not change any code. The route is dynamic — one route handles any wallet address automatically.

This is the core power of URL parameters.

---

## What just happened — the full picture

```
Browser requests:
http://localhost:3000/api/nfts/0xABC123
          |
          | Express reads the URL
          | sees :address = "0xABC123"
          |
          v
    Your route runs
    req.params.address = "0xABC123"
    builds the mockNFTs array with that address
          |
          v
    res.json(...) sends back JSON
          |
          v
Browser receives:
{ wallet: "0xABC123", nfts: [...] }
```

---

## Challenge — try this yourself

Before moving on, make these small changes to test your understanding:

1. **Add a third NFT** to the `mockNFTs` array with a `tokenId` of `'3'`
2. **Add a new field** called `chain` with the value `'ethereum'` to each NFT object
3. **Create a second route** at `/api/balance/:address` that returns `{ wallet: address, balance: '1.5' }`

If all three work when you test them in the browser, you understand URL parameters.

---

## What comes next

Right now `mockNFTs` is fake data you wrote by hand. The next step is replacing it with a real ethers.js call that reads actual NFT ownership from your contract:

```js
// Instead of mockNFTs, you will do something like:
const contract = new Contract(NFT_ADDRESS, ABI, provider)
const balance = await contract.balanceOf(address)
```

But the route structure — `app.get('/api/nfts/:address', ...)` — stays exactly the same. You are just swapping the fake data for real data.