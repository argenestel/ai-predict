import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoAdd, IoRemove, IoTimeOutline, IoWalletOutline, IoTrailSign } from 'react-icons/io5';

interface PredictionCardProps {
  predictionId: bigint;
  usePredictionDetails: (id: bigint) => any;
  onPredict: (id: number, isYes: boolean, amount: number) => void;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ 
  predictionId, 
  usePredictionDetails, 
  onPredict,
}) => {
  const [shareAmount, setShareAmount] = useState(1);
  const [isYesSelected, setIsYesSelected] = useState(true);
  const { data: prediction, isLoading } = usePredictionDetails(predictionId);

  const handleIncrement = () => setShareAmount(prev => prev + 1);
  const handleDecrement = () => setShareAmount(prev => Math.max(1, prev - 1));

  const handlePredict = () => {
    onPredict(Number(predictionId), isYesSelected, shareAmount);
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const calculatePercentage = (votes: bigint, total: bigint) => {
    const votesNum = Number(votes) || 0;
    const totalNum = Number(total) || 0;
    return totalNum > 0 ? (votesNum / totalNum) * 100 : 50;
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 p-4 flex items-center justify-center bg-white dark:bg-navy-800 rounded-xl shadow-lg overflow-hidden">
        <div className="animate-pulse flex flex-col items-center space-y-4 w-full">
          <div className="h-6 bg-gray-300 dark:bg-navy-600 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-navy-600 rounded w-1/2"></div>
          <div className="h-2 bg-gray-300 dark:bg-navy-600 rounded w-full"></div>
          <div className="flex space-x-4 w-full">
            <div className="h-8 bg-gray-300 dark:bg-navy-600 rounded w-1/2"></div>
            <div className="h-8 bg-gray-300 dark:bg-navy-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  const [description, endTime, status, totalVotes, outcome, minVotes, maxVotes, predictionType, creator, creationTime, tags, optionsCount, totalBetAmount] = prediction;

  const yesVotes = totalVotes[0] ? Number(totalVotes[0]) : 0;
  const noVotes = totalVotes[1] ? Number(totalVotes[1]) : 0;
  const totalVotesCount = yesVotes + noVotes;

  const yesPercentage = calculatePercentage(BigInt(yesVotes), BigInt(totalVotesCount));
  const noPercentage = calculatePercentage(BigInt(noVotes), BigInt(totalVotesCount));

  const isActive = status === 0;
  const totalEth = Number(totalBetAmount) / 1e18; // Convert from Wei to ETH

  return (
    <div className="w-full h-full bg-white dark:bg-navy-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-200 dark:border-navy-700 flex flex-col">
      <div className="p-4 flex-grow">
        <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-2 line-clamp-2">
          {description}
        </h2>
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <IoTimeOutline className="mr-1" />
            <span>Ends: {formatTime(endTime)}</span>
          </div>
          <div className="flex items-center">
            <IoWalletOutline className="mr-1" />
            <span>{totalEth.toFixed(4)} ETH</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex-grow">
            <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-brand-500 dark:from-green-500 dark:to-brand-400"
                initial={{ width: 0 }}
                animate={{ width: `${yesPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-green-500 dark:text-green-400 w-12 text-right">{yesPercentage.toFixed(1)}%</span>
          <span className="text-sm font-medium text-red-500 dark:text-red-400 w-12 text-right">{noPercentage.toFixed(1)}%</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <IoTrailSign className="mr-1" />
          {tags.map((tag, index) => (
            <span key={index} className="mr-2 bg-gray-200 dark:bg-navy-700 px-2 py-1 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Min Votes: {Number(minVotes)}</p>
          <p>Max Votes: {Number(maxVotes)}</p>
          <p>Creator: {creator.slice(0, 6)}...{creator.slice(-4)}</p>
          <p>Created: {formatTime(creationTime)}</p>
        </div>
      </div>

      {isActive && (
        <div className="p-4 bg-gray-50 dark:bg-navy-900">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 flex-grow">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsYesSelected(true)}
                className={`py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium flex-1 ${
                  isYesSelected 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Yes
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsYesSelected(false)}
                className={`py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium flex-1 ${
                  !isYesSelected 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                No
              </motion.button>
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDecrement}
              className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-full p-1"
            >
              <IoRemove size={14} />
            </motion.button>
            <input 
              type="number" 
              value={shareAmount}
              onChange={(e) => setShareAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center border dark:border-navy-600 rounded-lg py-1 bg-white dark:bg-navy-900 text-gray-700 dark:text-gray-300 text-sm"
            />
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleIncrement}
              className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-full p-1"
            >
              <IoAdd size={14} />
            </motion.button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePredict}
            className="w-full bg-gradient-to-r from-brand-400 to-brand-500 dark:from-brand-500 dark:to-brand-400 text-white rounded-lg py-2 px-4 transition-all duration-200 text-sm font-medium"
          >
            Predict
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default PredictionCard;