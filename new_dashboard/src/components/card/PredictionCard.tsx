import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoAdd, IoRemove, IoTimeOutline, IoWalletOutline } from 'react-icons/io5';

interface PredictionCardProps {
  predictionId: bigint;
  getPredictionDetails: (id: number) => Promise<any>;
  onPredict: (id: number, isYes: boolean, amount: number) => void;
  prediction: any;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ 
  predictionId, 
  getPredictionDetails, 
  onPredict,
  prediction
}) => {
  const [shareAmount, setShareAmount] = useState(1);
  const [isYesSelected, setIsYesSelected] = useState(true);

  if (!prediction) {
    return <div className="w-full p-4 text-center">Loading prediction data...</div>;
  }

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

  const yesVotes = prediction[3] && prediction[3][0] ? Number(prediction[3][0]) : 0;
  const noVotes = prediction[3] && prediction[3][1] ? Number(prediction[3][1]) : 0;
  const totalVotes = Number(prediction[12]) || 0;

  const yesPercentage = calculatePercentage(BigInt(yesVotes), BigInt(totalVotes));
  const noPercentage = calculatePercentage(BigInt(noVotes), BigInt(totalVotes));

  const isActive = prediction[2] === 0;
  const totalEth = (yesVotes + noVotes) / 1e18; // Convert from Wei to ETH

  const title = prediction[0] || 'No description available';

  return (
    <div className="w-full bg-white dark:bg-navy-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-200 dark:border-navy-700">
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-navy-700 dark:text-white mb-2 sm:mb-0">
            {title}
          </h2>
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <IoTimeOutline className="mr-1" />
              <span>{formatTime(prediction[1])}</span>
            </div>
            <div className="flex items-center">
              <IoWalletOutline className="mr-1" />
              <span>{totalEth.toFixed(6)} ETH</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <div className="flex-grow">
            <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2 sm:h-3 overflow-hidden">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-brand-500 dark:from-green-500 dark:to-brand-400"
                initial={{ width: 0 }}
                animate={{ width: `${yesPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <span className="text-xs sm:text-sm font-medium text-green-500 dark:text-green-400 w-12 text-right">{yesPercentage.toFixed(1)}%</span>
          <span className="text-xs sm:text-sm font-medium text-red-500 dark:text-red-400 w-12 text-right">{noPercentage.toFixed(1)}%</span>
        </div>

        {isActive && (
          <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsYesSelected(true)}
                className={`py-1 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none ${
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
                className={`py-1 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none ${
                  !isYesSelected 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                No
              </motion.button>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
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
                className="w-12 sm:w-16 text-center border dark:border-navy-600 rounded-lg py-1 bg-white dark:bg-navy-900 text-gray-700 dark:text-gray-300 text-xs sm:text-sm"
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
              className="bg-gradient-to-r from-brand-400 to-brand-500 dark:from-brand-500 dark:to-brand-400 text-white rounded-lg py-1 sm:py-2 px-3 sm:px-4 transition-all duration-200 text-xs sm:text-sm font-medium w-full sm:w-auto"
            >
              Predict
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionCard;