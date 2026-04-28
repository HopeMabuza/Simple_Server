# CORS — Why it breaks and how to fix it

## What is CORS?

CORS stands for **Cross-Origin Resource Sharing**.

An "origin" is just the combination of three things:

```
protocol + domain + port

http://localhost:3000   ← one origin
http://localhost:5173   ← a different origin (different port)
https://myapp.com       ← another different origin
```

When your React frontend (running on port 5173) tries to call your Express server (running on port 3000), the browser notices they are on different origins and **blocks the request by default**.

This is a browser security rule — it stops random websites from making requests to your server on behalf of a user without your permission.

---

## What the error looks like

In your browser console you will see something like:

```
Access to fetch at 'http://localhost:3000/api/nfts/0xABC'
from origin 'http://localhost:5173' has been blocked by CORS policy.
```

> **Important:** CORS is enforced by the browser, not the server. If you test your server with `curl` or Postman it works fine — because those tools are not browsers. The moment a browser makes the same request, it gets blocked.

---

## The fix — 3 steps

### Step 1 — Install the cors package

You already have `cors` in your `package.json` so just run:

```bash
npm install
```

If you are starting a fresh project without it:

```bash
npm install cors
```

### Step 2 — Add it to your server

```js
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())  // ← this one line fixes it

app.get('/api/nfts/:address', (req, res) => {
  res.json({ wallet: req.params.address, nfts: [] })
})

app.listen(3000, () => console.log('Running on http://localhost:3000'))
```

What each new line does:

- `require('cors')` — loads the cors package into your file
- `app.use(cors())` — tells Express to attach a special header to every response that says "I allow other origins to call me." The browser reads that header and stops blocking the request.

### Step 3 — Test it

Your React fetch call should now work without any error:

```js
const response = await fetch('http://localhost:3000/api/nfts/0xABC123')
const data = await response.json()
console.log(data)
```

---

## What is actually happening under the hood

```
Without cors():

React (port 5173) ──── request ────► Express (port 3000)
                  ◄── BLOCKED by browser ✗


With app.use(cors()):

React (port 5173) ──── request ────► Express (port 3000)
                                   ◄── response with CORS header ✓
                  ◄── browser allows it through ✓
```

The server was always receiving the request and sending a response. The browser was the one throwing it away before your frontend could see it. Adding `cors()` puts a permission header on the response that tells the browser it is safe to pass through.

---

## Locking it down for production

`app.use(cors())` with no arguments allows **any** origin to call your server. This is fine for local development but dangerous in production — it means any website in the world could call your API.

Before going live, restrict it to your own frontend only:

```js
// Allow one origin
app.use(cors({
  origin: 'https://myapp.com'
}))
```

Or if you need to allow both local development and production at the same time:

```js
const allowedOrigins = [
  'http://localhost:5173',  // local React dev server
  'https://myapp.com'       // production frontend
]

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true)   // origin is allowed
    } else {
      callback(new Error('Not allowed by CORS'))  // origin is blocked
    }
  }
}))
```

---

## Summary

| Situation | What to use |
|---|---|
| Local development | `app.use(cors())` — allow everything |
| Single production domain | `app.use(cors({ origin: 'https://myapp.com' }))` |
| Multiple domains | `app.use(cors({ origin: allowedOrigins }))` with an array or function |

---

## The rule to remember

> Add `app.use(cors())` during development so your frontend and server can talk to each other. Before going to production, replace it with a specific origin so only your frontend is allowed in.

---

## Mini Exercise — See CORS break, then fix it

This exercise has two parts. First you will trigger the CORS error on purpose so you know exactly what it looks like. Then you will fix it.

### Part 1 — Trigger the error

**1. Start your Express server** (no cors yet):

```js
// index.js — intentionally missing cors
const express = require('express')
const app = express()

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the server' })
})

app.listen(3000, () => console.log('Running on http://localhost:3000'))
```

```bash
node index.js
```

**2. Create a plain HTML file** called `test.html` anywhere on your computer and open it in your browser:

```html
<!DOCTYPE html>
<html>
  <body>
    <button onclick="callServer()">Call the server</button>
    <p id="result"></p>

    <script>
      async function callServer() {
        try {
          const res = await fetch('http://localhost:3000/api/hello')
          const data = await res.json()
          document.getElementById('result').innerText = data.message
        } catch (err) {
          document.getElementById('result').innerText = 'Error: ' + err.message
        }
      }
    </script>
  </body>
</html>
```

**3. Click the button**, then open your browser DevTools (`F12`) and check the Console tab.

You should see the CORS error. Your server is running and working — but the browser is blocking the response from reaching your page.

---

### Part 2 — Fix it

**1. Stop your server** (`Ctrl + C` in the terminal)

**2. Update `index.js`** to add cors:

```js
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())  // ← add this

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the server' })
})

app.listen(3000, () => console.log('Running on http://localhost:3000'))
```

**3. Restart the server:**

```bash
node index.js
```

**4. Go back to `test.html` in the browser and click the button again.**

This time you should see:

```
Hello from the server
```

No error. The browser received the response and passed it through to your page.

---

### Part 3 — Challenge

Now that cors is working, try restricting it:

**1.** Change `app.use(cors())` to only allow `http://localhost:5173`:

```js
app.use(cors({ origin: 'http://localhost:5173' }))
```

**2.** Click the button in `test.html` again.

You will get the CORS error back — because `test.html` is not running on port 5173, so it is now blocked on purpose.

**3.** Add `null` to the allowed origins list (browsers send `null` as the origin for local HTML files):

```js
const allowedOrigins = ['http://localhost:5173', 'null']

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))
```

**4.** Restart and click the button again — it works.

You have now seen CORS break, fixed it wide open, and then locked it down to specific origins. That is everything you need to know about CORS for your dApps.