// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SimplePredictionMarketplace is Ownable {
    struct Prediction {
        string description;
        uint256 endTime;
        bool isResolved;
        uint256 totalPoolYes;
        uint256 totalPoolNo;
        mapping(address => uint256) yesVotes;
        mapping(address => uint256) noVotes;
        bool outcome;
    }

    mapping(uint256 => Prediction) public predictions;
    uint256 public predictionCounter;

    event PredictionCreated(uint256 indexed predictionId, string description, uint256 endTime);
    event BetPlaced(uint256 indexed predictionId, address indexed user, bool choice, uint256 amount);
    event PredictionResolved(uint256 indexed predictionId, bool outcome);
    event RewardsDistributed(uint256 indexed predictionId);

    constructor() Ownable(msg.sender) {}

    function createPrediction(string memory _description, uint256 _duration) external onlyOwner {
        uint256 predictionId = predictionCounter;
        Prediction storage newPrediction = predictions[predictionId];
        
        newPrediction.description = _description;
        newPrediction.endTime = block.timestamp + _duration;
        newPrediction.isResolved = false;

        emit PredictionCreated(predictionId, _description, newPrediction.endTime);
        
        predictionCounter++;
    }

    function placeBet(uint256 _predictionId, bool _choice) external payable {
        Prediction storage prediction = predictions[_predictionId];
        require(!prediction.isResolved, "Prediction is already resolved");
        require(block.timestamp < prediction.endTime, "Prediction has ended");

        if (_choice) {
            prediction.yesVotes[msg.sender] += msg.value;
            prediction.totalPoolYes += msg.value;
        } else {
            prediction.noVotes[msg.sender] += msg.value;
            prediction.totalPoolNo += msg.value;
        }

        emit BetPlaced(_predictionId, msg.sender, _choice, msg.value);
    }

    function resolvePrediction(uint256 _predictionId, bool _outcome) external onlyOwner {
        Prediction storage prediction = predictions[_predictionId];
        require(!prediction.isResolved, "Prediction is already resolved");
        require(block.timestamp >= prediction.endTime, "Prediction has not ended yet");

        prediction.isResolved = true;
        prediction.outcome = _outcome;

        emit PredictionResolved(_predictionId, _outcome);
    }

    function claimReward(uint256 _predictionId) external {
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.isResolved, "Prediction is not resolved yet");

        uint256 userBet = prediction.outcome ? prediction.yesVotes[msg.sender] : prediction.noVotes[msg.sender];
        require(userBet > 0, "No winning bet found");

        uint256 totalWinningPool = prediction.outcome ? prediction.totalPoolYes : prediction.totalPoolNo;
        uint256 totalPool = prediction.totalPoolYes + prediction.totalPoolNo;

        uint256 reward = (userBet * totalPool) / totalWinningPool;

        if (prediction.outcome) {
            prediction.yesVotes[msg.sender] = 0;
        } else {
            prediction.noVotes[msg.sender] = 0;
        }

        payable(msg.sender).transfer(reward);
    }

    function getPredictionDetails(uint256 _predictionId) external view returns (
        string memory description,
        uint256 endTime,
        bool isResolved,
        uint256 totalPoolYes,
        uint256 totalPoolNo,
        bool outcome
    ) {
        Prediction storage prediction = predictions[_predictionId];
        return (
            prediction.description,
            prediction.endTime,
            prediction.isResolved,
            prediction.totalPoolYes,
            prediction.totalPoolNo,
            prediction.outcome
        );
    }

    function getUserBet(uint256 _predictionId, address _user) external view returns (uint256 yesBet, uint256 noBet) {
        Prediction storage prediction = predictions[_predictionId];
        return (prediction.yesVotes[_user], prediction.noVotes[_user]);
    }
}