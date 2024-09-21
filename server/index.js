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
        const tx = await contract.createPrediction(
            prediction.description,
            prediction.duration,
            prediction.minVotes,
            prediction.maxVotes,
            prediction.predictionType,
            prediction.optionsCount,
            prediction.tags
        );
        await tx.wait();
        console.log(`Prediction created on contract. Transaction hash: ${tx.hash}`);
        return tx.hash;
    } catch (error) {
        console.error("Error creating prediction on contract:", error);
        throw new Error("Failed to create prediction on contract");
    }
}

app.post("/generate-predictions", async (req, res) => {
    try {
        const { article } = req.body;
        if (!article) {
            return res.status(400).json({ error: "Article content is required" });
        }

        const prompt = `Generate prediction market questions based on the following recent news about crypto and bitcoin: ${article}`;
        const predictions = await generatePredictions(prompt);

        const createdPredictions = await Promise.all(predictions.map(async (prediction) => {
            const txHash = await createPredictionOnContract(prediction);
            return { ...prediction, transactionHash: txHash };
        }));

        res.json({ predictions: createdPredictions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/finalize-prediction/:id", async (req, res) => {
    try {
        const predictionId = req.params.id;
        const { article } = req.body;
        
        if (!article) {
            return res.status(400).json({ error: "Article content is required for finalization" });
        }

        // Update the contract with the provided article
        await contract.receiveNewsData(predictionId, "Article Title", article);
        console.log(`Updated prediction ${predictionId} with news data`);

        // Finalize the prediction
        await contract.finalizePrediction(predictionId);
        console.log(`Finalized prediction ${predictionId}`);

        res.json({ message: `Prediction ${predictionId} finalized successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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