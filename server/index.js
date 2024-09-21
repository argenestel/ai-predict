const express = require("express");
const axios = require("axios");
const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Enable CORS for all routes
app.use(cors());

// OpenAI Configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

// Function to fetch content from a URL
async function fetchContent(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching URL:", error);
        throw new Error("Failed to fetch URL content");
    }
}

// Function to generate predictions using OpenAI GPT-4o
async function generatePredictions(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a prediction market expert. Generate 3 prediction market questions based on the given content. Each prediction should be specific, measurable, and have a clear timeframe. Output should be a valid JSON array of prediction objects. Do not use backticks or any other formatting.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
        });

        let predictions;
        try {
            predictions = JSON.parse(response.choices[0].message.content);
        } catch (parseError) {
            console.error("Error parsing OpenAI response:", parseError);
            console.log("Raw response:", response.choices[0].message.content);
            
            // Attempt to clean the response and parse again
            const cleanedContent = response.choices[0].message.content
                .replace(/`/g, '') // Remove backticks
                .replace(/\n/g, ' ') // Remove newlines
                .trim();
            
            try {
                predictions = JSON.parse(cleanedContent);
            } catch (secondParseError) {
                console.error("Error parsing cleaned OpenAI response:", secondParseError);
                throw new Error("Failed to parse OpenAI response into valid JSON");
            }
        }

        if (!Array.isArray(predictions)) {
            throw new Error("OpenAI response is not an array");
        }

        return predictions.map((prediction) => ({
            ...prediction,
            minVotes: 1,
            maxVotes: 1000,
            predictionType: 0,
            optionsCount: 2,
        }));
    } catch (error) {
        console.error("Error generating predictions:", error);
        throw new Error("Failed to generate predictions: " + error.message);
    }
}

// Function to get price data from Pyth using Hermes API
async function getPythPrice(pairId) {
    try {
        const response = await axios.get(`https://hermes.pyth.network/api/latest_price_feeds?ids[]=${pairId}`);
        
        if (response.data && response.data.length > 0) {
            const priceData = response.data[0].price;
            return {
                price: parseFloat(priceData.price) * Math.pow(10, priceData.expo),
                confidence: parseFloat(priceData.conf) * Math.pow(10, priceData.expo),
                timestamp: priceData.publish_time,
            };
        } else {
            throw new Error("Price feed not found");
        }
    } catch (error) {
        console.error("Error fetching Pyth price:", error);
        throw new Error("Failed to fetch Pyth price");
    }
}

// Endpoint to generate predictions from query or URL
app.post("/generate-predictions", async (req, res) => {
    try {
        const { query, url } = req.body;
        let content = query;

        if (url) {
            content = await fetchContent(url);
        }

        const prompt = `Generate prediction market questions based on the following content: ${content}`;
        const predictions = await generatePredictions(prompt);

        res.json({ predictions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get price data from Pyth
app.get("/pyth-price/:pairId", async (req, res) => {
    try {
        const { pairId } = req.params;
        const priceData = await getPythPrice(pairId);
        res.json(priceData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});