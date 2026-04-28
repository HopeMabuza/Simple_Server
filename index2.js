//we are creating a route for our nft data
const express = require("express")
const app = express()

app.get('/', (req, res) => {
    res.json({message: "We are in the root, the server is running"})
})

app.get('/api/nfts/:address', (req, res) => {
    const {address} = req.params

    const mockNFTs = [
        {
            tokenId: '1',
            name: 'Cool NFT 1',
            owner: address,
            image: 'https://example.com/nft1.png',
            attributes: [{trait: 'Background', value: 'Blue'}]
        },
        {
            tokenId: '2',
            name: 'Cool NFT 2',
            owner: address,
            image: 'https://example.com/nft2.png',
            attributes: [{trait: 'Background', value: 'Red'}]
        }
    ]

    res.json({wallet: address, nfts: mockNFTs})
})

app.listen(3000, () => console.log('Running on http://localhost:3000'))