export const abi =[
    {
      "type": "constructor",
      "inputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "addValidTag",
      "inputs": [
        {
          "name": "_tag",
          "type": "string",
          "internalType": "string"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "cancelPrediction",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "claimReward",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "createPrediction",
      "inputs": [
        {
          "name": "_description",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "_duration",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "_minimumBet",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "_maximumBet",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "_optionsCount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "finalizePrediction",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "_outcome",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getPredictionDetails",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "description",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "endTime",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "status",
          "type": "uint8",
          "internalType": "enum PredictionMarketplace.PredictionStatus"
        },
        {
          "name": "totalPools",
          "type": "uint256[]",
          "internalType": "uint256[]"
        },
        {
          "name": "outcome",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "minimumBet",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "maximumBet",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "optionsCount",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "totalVotes",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserBet",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "_option",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "hasUserVoted",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "placeBet",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "_option",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "predictionCounter",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "predictions",
      "inputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "description",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "endTime",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "status",
          "type": "uint8",
          "internalType": "enum PredictionMarketplace.PredictionStatus"
        },
        {
          "name": "outcome",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "minimumBet",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "maximumBet",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "optionsCount",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "totalVotes",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "removeValidTag",
      "inputs": [
        {
          "name": "_tag",
          "type": "string",
          "internalType": "string"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "userBets",
      "inputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "userVotes",
      "inputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "validTags",
      "inputs": [
        {
          "name": "",
          "type": "string",
          "internalType": "string"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "vote",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "BetPlaced",
      "inputs": [
        {
          "name": "predictionId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "user",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "option",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "previousOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "PredictionCancelled",
      "inputs": [
        {
          "name": "predictionId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "PredictionCreated",
      "inputs": [
        {
          "name": "predictionId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "description",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "endTime",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "optionsCount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "PredictionFinalized",
      "inputs": [
        {
          "name": "predictionId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "outcome",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "TagAdded",
      "inputs": [
        {
          "name": "tag",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "TagRemoved",
      "inputs": [
        {
          "name": "tag",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "VoteCast",
      "inputs": [
        {
          "name": "predictionId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "voter",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "OwnableInvalidOwner",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "error",
      "name": "OwnableUnauthorizedAccount",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ]
    }
  ]