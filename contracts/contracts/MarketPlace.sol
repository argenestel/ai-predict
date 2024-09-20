// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PredictionMarketplace is Ownable {
    enum PredictionStatus { ACTIVE, FINALIZED, CANCELLED }

    struct Prediction {
        string description;
        uint256 endTime;
        PredictionStatus status;
        uint256[] totalPools;
        uint256 outcome;
        uint256 minimumBet;
        uint256 maximumBet;
        uint256 optionsCount;
        uint256 totalVotes;
    }

    mapping(uint256 => Prediction) public predictions;
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public userBets;
    mapping(uint256 => mapping(address => bool)) public userVotes;
    mapping(string => bool) public validTags;
    uint256 public predictionCounter;

    event PredictionCreated(uint256 indexed predictionId, string description, uint256 endTime, uint256 optionsCount);
    event BetPlaced(uint256 indexed predictionId, address indexed user, uint256 option, uint256 amount);
    event PredictionFinalized(uint256 indexed predictionId, uint256 outcome);
    event PredictionCancelled(uint256 indexed predictionId);
    event TagAdded(string tag);
    event TagRemoved(string tag);
    event VoteCast(uint256 indexed predictionId, address indexed voter);

    constructor() Ownable(msg.sender) {}

    function createPrediction(
        string memory _description,
        uint256 _duration,
        uint256 _minimumBet,
        uint256 _maximumBet,
        uint256 _optionsCount
    ) external onlyOwner {
        require(_optionsCount >= 2, "Must have at least 2 options");
        uint256 predictionId = predictionCounter++;

        Prediction storage newPrediction = predictions[predictionId];
        newPrediction.description = _description;
        newPrediction.endTime = block.timestamp + _duration;
        newPrediction.status = PredictionStatus.ACTIVE;
        newPrediction.minimumBet = _minimumBet;
        newPrediction.maximumBet = _maximumBet;
        newPrediction.optionsCount = _optionsCount;

        for (uint256 i = 0; i < _optionsCount; i++) {
            newPrediction.totalPools.push(0);
        }


        emit PredictionCreated(predictionId, _description, newPrediction.endTime, _optionsCount);
    }

    function placeBet(uint256 _predictionId, uint256 _option) external payable {
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.status == PredictionStatus.ACTIVE, "Prediction is not active");
        require(block.timestamp < prediction.endTime, "Prediction has ended");
        require(_option < prediction.optionsCount, "Invalid option");
        require(msg.value >= prediction.minimumBet && msg.value <= prediction.maximumBet, "Bet amount out of range");

        prediction.totalPools[_option] += msg.value;
        userBets[_predictionId][msg.sender][_option] += msg.value;

        emit BetPlaced(_predictionId, msg.sender, _option, msg.value);
    }

    function finalizePrediction(uint256 _predictionId, uint256 _outcome) external onlyOwner {
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.status == PredictionStatus.ACTIVE, "Prediction is not active");
        require(block.timestamp >= prediction.endTime, "Prediction has not ended yet");
        require(_outcome < prediction.optionsCount, "Invalid outcome");

        prediction.status = PredictionStatus.FINALIZED;
        prediction.outcome = _outcome;

        emit PredictionFinalized(_predictionId, _outcome);
    }

    function cancelPrediction(uint256 _predictionId) external onlyOwner {
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.status == PredictionStatus.ACTIVE, "Prediction is not active");

        prediction.status = PredictionStatus.CANCELLED;

        emit PredictionCancelled(_predictionId);
    }

    function claimReward(uint256 _predictionId) external {
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.status == PredictionStatus.FINALIZED, "Prediction is not finalized");

        uint256 userBet = userBets[_predictionId][msg.sender][prediction.outcome];
        require(userBet > 0, "No winning bet found");

        uint256 totalWinningPool = prediction.totalPools[prediction.outcome];
        uint256 totalPool = 0;
        for (uint256 i = 0; i < prediction.optionsCount; i++) {
            totalPool += prediction.totalPools[i];
        }

        uint256 reward = (userBet * totalPool) / totalWinningPool;
        userBets[_predictionId][msg.sender][prediction.outcome] = 0;

        payable(msg.sender).transfer(reward);
    }

    function addValidTag(string memory _tag) external onlyOwner {
        require(!validTags[_tag], "Tag already exists");
        validTags[_tag] = true;
        emit TagAdded(_tag);
    }

    function removeValidTag(string memory _tag) external onlyOwner {
        require(validTags[_tag], "Tag does not exist");
        validTags[_tag] = false;
        emit TagRemoved(_tag);
    }

    function vote(uint256 _predictionId) external {
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.status == PredictionStatus.ACTIVE, "Prediction is not active");
        require(!userVotes[_predictionId][msg.sender], "User has already voted");

        userVotes[_predictionId][msg.sender] = true;
        prediction.totalVotes++;

        emit VoteCast(_predictionId, msg.sender);
    }

    function getPredictionDetails(uint256 _predictionId) external view returns (
        string memory description,
        uint256 endTime,
        PredictionStatus status,
        uint256[] memory totalPools,
        uint256 outcome,
        uint256 minimumBet,
        uint256 maximumBet,
        uint256 optionsCount,
        uint256 totalVotes
    ) {
        Prediction storage prediction = predictions[_predictionId];
        return (
            prediction.description,
            prediction.endTime,
            prediction.status,
            prediction.totalPools,
            prediction.outcome,
            prediction.minimumBet,
            prediction.maximumBet,
            prediction.optionsCount,
            prediction.totalVotes
        );
    }

    function getUserBet(uint256 _predictionId, address _user, uint256 _option) external view returns (uint256) {
        return userBets[_predictionId][_user][_option];
    }

    function hasUserVoted(uint256 _predictionId, address _user) external view returns (bool) {
        return userVotes[_predictionId][_user];
    }
}