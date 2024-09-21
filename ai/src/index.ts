import { Request, Response, route } from "./httpSupport";
import fetch from "node-fetch";

async function fetchArticle(url: string): Promise<string> {
	const response = await fetch(url);
	const contentType = response.headers.get("content-type");


	return await response.text();

	
}

async function processWithRedPillAI(
	prompt: string,
	apiKey: string,
	model: string = "gpt-4o",
): Promise<string> {
	const response = await fetch("https://api.red-pill.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			messages: [{ role: "user", content: prompt }],
			model: model,
		}),
	});

	const responseData = await response.json();
	if (responseData.error) {
		throw new Error(responseData.error);
	}
	return responseData.choices[0].message.content;
}

async function extractInformation(text: string, apiKey: string): Promise<any> {
	const prompt = `Extract key information from the following content. Provide a JSON object with relevant fields such as title, author, date, main points, and any other important details. If the content is not an article, describe what it contains:\n\n${text}`;
	const result = await processWithRedPillAI(prompt, apiKey);
	return JSON.parse(result);
}

async function answerQuestion(
	question: string,
	apiKey: string,
): Promise<string> {
	const prompt = `Please answer the following question to the best of your ability: ${question}`;
	return await processWithRedPillAI(prompt, apiKey);
}

async function generatePredictions(data: string, apiKey: string): Promise<string[]> {
	const prompt = `Based on the following prediction market data, generate 5 new, creative prediction questions that are related to the themes present in the data but not exact duplicates. Each question should be specific, measurable, and have a clear timeframe. The Current Year is 2024 I will Provide more Date specific Info Always create Farther  then the Current Time Also Output in Json Format Given as .{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Create Prediction Parameters",
  "type": "object",
  "properties": {
    "description": {
      "type": "string",
      "description": "A detailed description of the prediction"
    },
    "duration": {
      "type": "integer",
      "description": "The duration of the prediction in seconds",
      "minimum": 1
    },
    "minVotes": {
      "type": "integer",
      "description": "The minimum number of votes required",
      "minimum": 1
    },
    "maxVotes": {
      "type": "integer",
      "description": "The maximum number of votes allowed",
      "minimum": 1
    },
    "predictionType": {
      "type": "integer",
      "enum": [0, 1, 2],
      "description": "The type of prediction (0: Binary, 1: Multiple Choice, 2: Range)"
    },
    "optionsCount": {
      "type": "integer",
      "description": "The number of options for the prediction",
      "minimum": 2,
      "maximum": 10
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "An array of tags associated with the prediction"
    }
  },
  "required": [
    "description",
    "duration",
    "minVotes",
    "maxVotes",
    "predictionType",
    "optionsCount",
    "tags"
  ],
  "additionalProperties": false
}
To create 

const predictionParams = {
  description: "Will it rain tomorrow in New York City?",
  duration: 86400, // 24 hours in seconds
  minVotes: 10,
  maxVotes: 1000,
  predictionType: 0, // Binary (Yes/No)
  optionsCount: 2,
  tags: ["weather", "NYC", "rain"]
};


Here's the data:

${data}

New Prediction Questions:`;

	const result = await processWithRedPillAI(prompt, apiKey);
	return result.split('\n').filter(line => line.trim() !== '').map(line => line.replace(/^\d+\.\s*/, ''));
}

function getApiKey(req: Request): string {
	const secrets = req.secret || {};
	if (typeof secrets.apiKey === "string") {
		return secrets.apiKey;
	}
	return "sk-qVBlJkO3e99t81623PsB0zHookSQJxU360gDMooLenN01gv2";
}

async function GET(req: Request): Promise<Response> {
	const queries = req.queries;
	const apiKey = getApiKey(req);
	const url = queries.url ? queries.url[0] : "";
	const question = queries.query ? queries.query[0] : "";
	const generatePredictionsFlag = queries.generatePredictions ? queries.generatePredictions[0] === "true" : false;

	if (url) {
		try {
			const content = await fetchArticle(url);
			if (generatePredictionsFlag) {
				// Generate predictions based on the content
				const predictions = await generatePredictions(content, apiKey);
				return new Response(JSON.stringify({ predictions }));
			} else {
				// Handle article analysis
				const result = await extractInformation(content, apiKey);
				return new Response(JSON.stringify(result));
			}
		} catch (error) {
			console.error("Error processing content:", error);
			return new Response(
				JSON.stringify({ error: "Failed to process content" }),
			);
		}
	} else if (question) {
		// Handle open-ended question
		try {
			const answer = await answerQuestion(question, apiKey);
			return new Response(JSON.stringify({ answer }));
		} catch (error) {
			console.error("Error answering question:", error);
			return new Response(
				JSON.stringify({ error: "Failed to answer question" }),
			);
		}
	} else {
		return new Response(
			JSON.stringify({ error: "Either URL or query parameter is required" }),
		);
	}
}

export default async function main(request: string) {
	return await route({ GET }, request);
}