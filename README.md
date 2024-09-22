## #Predict.AI


AI Prediction marketplace on Morph Chain



Setup

Clone the repository
Install dependencies:
npm install

Create a .env file in the root directory with the following variables:

```
PORT=4000
MORPH_CHAIN_RPC_URL=https://rpc.morpheus.blockchain.binance.com
PRIVATE_KEY=your_private_key
PRIVATE_KEY_FAUCET=your_faucet_private_key
CONTRACT_ADDRESS=your_contract_address
OPENAI_API_KEY=your_openai_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
```
Start the server:
npm start


API Endpoints
Prediction Management

Generate Predictions

POST /generate-predictions
Generates predictions based on a given topic
Body: { "topic": "your topic" }


Get Prediction Details

GET /prediction/:id
Retrieves details of a specific prediction


Finalize Prediction

POST /finalize-prediction/:id
Finalizes a prediction using AI



Financial Data

Get Crypto Prices

GET /pyth-price/:pair
Retrieves current price for a crypto pair (e.g., btc-usd, eth-usd)


Get All Crypto Prices

GET /pyth-price/all
Retrieves current prices for all supported crypto pairs



User Management

Request ETH (Faucet)

POST /request-eth
Sends a small amount of ETH to the requested address on Morph Chain
Body: { "address": "user_ethereum_address" }


Get User Stats

GET /user-stats/:address
Retrieves stats for a specific user address



Testing Endpoints

Test Generate Predictions

POST /test/generate-predictions
Generates test predictions without creating them on the blockchain


Test Finalize Prediction

POST /test/finalize-prediction
Tests the prediction finalization process without affecting the blockchain



# Phala AI Deployed At

✔ Successfully uploaded file to IPFS.

✔ Files stored at the following IPFS URI: ipfs://QmVtHCLnGieoGFqQEUeXXRf6xRrZyS1nMUmruNdkEtgfP4

✔ Open this link to view your upload: https://80ab3a7d3310cd736fdf9b2cc013e8ee.ipfscdn.io/ipfs/bafybeidqdqi4ai45bybj3d2tyzeil3v7dv2hs4ugvazsudqwlcys7gk7p4/


Agent Contract deployed at: https://wapo-testnet.phala.network/ipfs/QmVtHCLnGieoGFqQEUeXXRf6xRrZyS1nMUmruNdkEtgfP4
