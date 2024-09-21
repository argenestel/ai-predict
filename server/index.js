const express = require('express');
const { OpenAI } = require('openai');
const ethers = require('ethers');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// OpenAI Configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Ethereum Configuration
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractABI = require('./contractABI.json');
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, wallet);
let currentNonce = null;
async function generatePredictions(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a prediction market expert. Generate 3 prediction market questions based on the given content. Each prediction should be specific, measurable, and have a clear timeframe. Output should be a valid JSON array of prediction objects with 'description', 'duration' (in seconds), and 'tags' fields."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        let predictions = JSON.parse(response.choices[0].message.content);
        return predictions.map(prediction => ({
            ...prediction,
            minVotes: 1,
            maxVotes: 1000,
            predictionType: 0,
            optionsCount: 2
        }));
    } catch (error) {
        console.error("Error generating predictions:", error);
        throw new Error("Failed to generate predictions: " + error.message);
    }
}

async function createPredictionOnContract(prediction) {
    try {
        console.log("Attempting to create prediction on contract:", prediction);
        console.log("Contract address:", contractAddress);
        console.log("Wallet address:", wallet.address);

        // Get the current nonce if we don't have it
        if (currentNonce === null) {
            currentNonce = await wallet.getTransactionCount();
        }

        console.log("Using nonce:", currentNonce);

        const tx = await contract.createPrediction(
            prediction.description,
            prediction.duration,
            prediction.minVotes,
            prediction.maxVotes,
            prediction.predictionType,
            prediction.optionsCount,
            prediction.tags,
            { nonce: currentNonce }
        );

        console.log("Transaction sent:", tx.hash);
        currentNonce++; // Increment the nonce for the next transaction
        
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        return tx.hash;
    } catch (error) {
        console.error("Detailed error in createPredictionOnContract:", error);
        
        // If the error is due to nonce being too low, we'll reset it
        if (error.message.includes("nonce too low")) {
            console.log("Nonce too low, resetting...");
            currentNonce = null;
        }
        
        throw new Error(`Failed to create prediction on contract: ${error.message}`);
    }
}

app.post("/generate-predictions", async (req, res) => {
    try {
        console.log("Received request to generate predictions");
        const { article } = req.body;
        if (!article) {
            return res.status(400).json({ error: "Article content is required" });
        }

        console.log("Generating predictions for article:", article);
        const prompt = `Generate prediction market questions based on the following recent news about crypto and bitcoin: ${article}`;
        const predictions = await generatePredictions(prompt);
        console.log("Generated predictions:", predictions);

        const createdPredictions = [];
        for (const prediction of predictions) {
            try {
                console.log("Creating prediction on contract:", prediction);
                const txHash = await createPredictionOnContract(prediction);
                console.log("Prediction created with transaction hash:", txHash);
                createdPredictions.push({ ...prediction, transactionHash: txHash });
            } catch (error) {
                console.error("Error creating prediction:", error);
                createdPredictions.push({ ...prediction, error: error.message });
            }
        }

        res.json({ predictions: createdPredictions });
    } catch (error) {
        console.error("Error in generate-predictions endpoint:", error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});
app.post("/finalize-prediction/:id", async (req, res) => {
    try {
        const predictionId = req.params.id;
        const { article } = req.body;
        
        if (!article) {
            return res.status(400).json({ error: "Article content is required for finalization" });
        }

        console.log(`Finalizing prediction ${predictionId} based on article:`, article);

        // Determine the outcome based on the article
        const outcome = await determineOutcome(article);

        console.log(`Determined outcome for prediction ${predictionId}:`, outcome);

        // Finalize the prediction with the determined outcome
        const tx = await contract.finalizePrediction(predictionId, outcome);
        await tx.wait();

        console.log(`Finalized prediction ${predictionId} with transaction hash:`, tx.hash);

        res.json({ 
            message: `Prediction ${predictionId} finalized successfully`,
            outcome: outcome,
            transactionHash: tx.hash
        });
    } catch (error) {
        console.error("Error in finalize-prediction endpoint:", error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

async function determineOutcome(article) {
    try {
        const prompt = `Based on the following article, determine the most likely outcome Yes for 0 and no for 1. The outcome should be an integer between 0 and 1, where 0 represents a negative outcome and 1 represents a positive outcome. Only respond with either 0 or 1.\n\nArticle: ${article}`;
        
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an AI assistant that determines outcomes for prediction markets based on news articles." },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
        });

        const outcome = parseInt(response.choices[0].message.content.trim());
        
        if (isNaN(outcome) || (outcome !== 0 && outcome !== 1)) {
            throw new Error("Invalid outcome determined by AI");
        }

        return outcome;
    } catch (error) {
        console.error("Error determining outcome:", error);
        throw new Error("Failed to determine outcome: " + error.message);
    }
}
app.get("/prediction/:id", async (req, res) => {
    try {
        const predictionId = req.params.id;
        const prediction = await contract.getPredictionDetails(predictionId);
        res.json(prediction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/user-stats/:address", async (req, res) => {
    try {
        const userAddress = req.params.address;
        const stats = await contract.getUserStats(userAddress);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});