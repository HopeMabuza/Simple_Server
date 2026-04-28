// index.js — intentionally missing cors
const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors({origin: 'http://127.0.0.1:5500'}))

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the server' })
})

app.listen(3000, () => console.log('Running on http://localhost:3000'))