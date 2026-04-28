# Smart Contract vs Express Server — In Plain English

## Think of it like a vending machine and a shop assistant

A **smart contract** is like a vending machine.

- It has strict rules built in
- It does exactly what it's programmed to do
- Nobody can cheat it or change its rules
- But it can't call you, browse the internet, or send you a receipt email — it just sits there and does its one job

An **Express server** is like the shop assistant standing next to the vending machine.

- They can call you when your order is ready
- They can look up prices online
- They can check stock in the back room
- They connect the machine to the rest of the world

---

## What the smart contract does in an NFT marketplace

The contract lives on the blockchain and handles the stuff that needs to be 100% trustworthy:

- Keeping track of who owns which NFT
- Moving an NFT from the seller to the buyer when a sale happens
- Holding the money safely until the sale goes through
- Announcing to the network "hey, a sale just happened"

No one can fake this or tamper with it. It's the truth, forever.

---

## What the smart contract literally cannot do

Here's the important part — a smart contract is a completely sealed box. It has:

- **No internet access** — it cannot call any website or API
- **No file system** — it cannot read or store images or documents
- **No way to send messages** — no emails, no notifications, no texts
- **No real sense of time** — it only knows what block number it's on

So the second your dApp needs to do anything outside the blockchain — show a price in USD, send an email, display an image — that job falls to your Express server.

---

## How the two work together

A simple way to picture it:

```
Your frontend (the website the user sees)
        |
        talks to
        |
Your Express server  <-- does the "real world" stuff
        |
   -----+--------
   |             |
   v             v
Blockchain    Everything else
(the contract) (APIs, images, emails, databases)
```

The contract is the **authority** — it holds the truth about who owns what.

The Express server is the **translator** — it takes that truth and makes it fast, readable, and connected to the real world.

---

## The best example: NFT images

When you mint an NFT, storing the actual image on the blockchain would cost a fortune in gas fees. So instead, the contract stores a tiny pointer that looks like this:

```
ipfs://QmXyz...
```

That's just a 7-character address pointing to where the image actually lives. Cheap to store, but useless on its own — your browser can't display `ipfs://QmXyz...` as an image.

Your Express server steps in, takes that pointer, fetches the real image, and serves it to the frontend as a normal URL the browser understands.

**Contract's job:** store the tiny pointer. Done.
**Server's job:** everything else — fetch, translate, cache, serve.

---

## What Express servers are used for in dApps

Here's everything a server handles across a typical dApp, in plain terms:

**1. Protecting secrets**
Your RPC keys (Alchemy, Infura), private keys for signing transactions, and third-party API keys all live on the server. The browser never sees them.

**2. Reading blockchain data efficiently**
Instead of your frontend making 50 direct RPC calls to render a page, your server batches them, caches the results, and sends back one clean response. This is why professional dApps feel fast and free RPC tiers don't get exhausted in an hour.

**3. Serving off-chain data**
NFT metadata, user profiles, token descriptions, collection images — anything too large or too expensive to store on-chain lives somewhere else (IPFS, S3, a database), and your server fetches and serves it.

**4. Indexing on-chain events**
Smart contracts emit events (Transfer, Sale, Mint). Your server listens for these and writes them into a proper database so your frontend can query them like normal data — sorted, filtered, paginated — without hitting the chain directly every time.

**5. Authentication**
Specifically Sign-In with Ethereum (SIWE) — the user signs a message with their wallet, your server verifies the signature, and issues a session. No passwords, no email, just the wallet as identity.

**6. Reacting to on-chain activity**
When something happens on-chain (an NFT sells, a loan gets liquidated, a governance vote passes), your server receives a webhook from Alchemy or Moralis and triggers real-world responses — emails, push notifications, Discord alerts, database updates.

**7. Abstracting complexity from the frontend**
Things like gas estimation, transaction building, ABI encoding, and multi-step contract interactions are messy. Your server handles all of that and exposes a simple REST endpoint. Your frontend just calls `/api/buy-nft` and gets back a transaction to sign.

**8. Rate limiting and access control**
Controlling who can call what, how often, and under what conditions — whitelists for a mint, gating features behind NFT ownership, blocking bots from your API.

---

## What data goes on-chain vs off-chain

A simple rule before the list: if someone needs to verify it without trusting you, it goes on-chain. If it's large, changes often, or needs to connect to the real world, it stays off-chain.

This applies to any type of smart contract — token contracts, DAOs, DeFi protocols, marketplaces, voting systems, and more.

### On-chain — stored in the smart contract

These need to be trustless, permanent, and verifiable by anyone.

| Data | Example |
|---|---|
| Balances and ownership | Who holds how many tokens, who owns an asset |
| Transaction history | Every transfer or interaction, recorded as events |
| Contract rules and logic | The conditions under which funds move or actions execute |
| Contract state | Paused/unpaused, locked/unlocked, active/expired |
| Addresses with special roles | Admins, approved operators, whitelisted wallets |
| Fees and rates | Protocol fee %, interest rate, royalty % |
| Vote results and proposals | DAO decisions that need to be tamper-proof |
| Merkle roots | A single hash proving membership in a list (e.g. allowlists) |
| External data pointers | A hash or URI pointing to a file stored elsewhere (e.g. IPFS) |
| Total supply or limits | Hard caps that users need to trust cannot be changed |

### Off-chain — handled by your server and external storage

These are too large, too expensive, or too flexible to live on-chain.

**Stored on IPFS**

| Data | Why it's off-chain |
|---|---|
| JSON metadata files | Descriptions, attributes, configuration — too large for the chain |
| Media files | Images, videos, documents — far too large and expensive to store on-chain |

**Stored in your database**

| Data | Why it's off-chain |
|---|---|
| User profiles | Display names, avatars, preferences — changes often, not trustless-critical |
| Indexed event history | Contract events written to a DB for fast, filterable queries |
| Search and filter indexes | Lets users sort and query data — the chain has no query language |
| Off-chain activity | Bids, drafts, or actions that only go on-chain if accepted |
| Analytics and engagement | View counts, click data, usage stats — no need for trustlessness |
| Notification preferences | Which wallet wants alerts for which contract events |
| Cached prices and rates | ETH/USD price, gas estimates — fetched from APIs and stored briefly |

**Handled by your Express server**

| Data | Why it's off-chain |
|---|---|
| Resolved file URLs | Converting a hash like `ipfs://QmXyz...` into a real HTTP URL |
| Cached RPC responses | Balances, contract reads — cached so you don't burn API credits |
| API keys and secrets | Alchemy, Infura, email providers — never exposed to the browser |
| Webhook reactions | When a contract event fires, the server reacts — sends emails, updates the DB |

---

### The two questions to ask about any piece of data

When you're unsure where something belongs, ask:

> **"Does someone need to verify this without trusting me?"**
> If yes → on-chain. Balances, votes, transfers — anyone can check independently.

> **"Is it large, or does it change often?"**
> If yes → off-chain. Files are huge. User preferences and prices change constantly — putting every update on-chain would cost a fortune in gas.

---

## The one rule to remember

> If it needs to be **trustworthy and permanent** → smart contract.
> If it needs to connect to **anything outside the blockchain** → Express server.

That line is the foundation of almost every dApp you'll ever build.