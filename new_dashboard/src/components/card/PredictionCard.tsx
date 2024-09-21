import React, { useState } from 'react';
import { IoAdd, IoRemove, IoTimeOutline, IoWalletOutline, IoChevronUpOutline, IoChevronDownOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import LineAreaChart from 'components/charts/LineAreaChart';

interface PredictionCardProps {
  predictionId: bigint;
  getPredictionDetails: (id: number) => Promise<any>;
  onPredict: (id: number, isYes: boolean, amount: number) => void;
  onFinalize: (id: number, outcome: number) => void;
  onCancel: (id: number) => void;
  onDistributeRewards: (id: number) => void;
  prediction: any;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ 
  predictionId, 
  getPredictionDetails, 
  onPredict, 
  onFinalize, 
  onCancel, 
  onDistributeRewards,
  prediction
}) => {
  const [shareAmount, setShareAmount] = useState(1);
  const [isYesSelected, setIsYesSelected] = useState(true);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  if (!prediction) {
    return <div>Loading prediction data...</div>;
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

  const formatEth = (value: bigint) => {
    return (Number(value) / 1e18).toFixed(6); // Convert from Wei to ETH and display 6 decimal places
  };

  const chartData = [
    {
      name: 'Yes Votes',
      data: [yesVotes],
    },
    {
      name: 'No Votes',
      data: [noVotes],
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-navy-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-200 dark:border-navy-700">
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold text-navy-700 dark:text-white truncate mr-4 mb-2 md:mb-0">
            {prediction[0] || 'No description available'}
          </h2>
          <div className="flex items-center space-x-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <IoTimeOutline className="mr-1 md:mr-2" />
              <span>{formatTime(prediction[1])}</span>
            </div>
            <div className="flex items-center">
              <IoWalletOutline className="mr-1 md:mr-2" />
              <span>{totalEth.toFixed(6)} ETH</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex-grow">
            <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2 md:h-3 overflow-hidden">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-brand-500 dark:from-green-500 dark:to-brand-400"
                initial={{ width: 0 }}
                animate={{ width: `${yesPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <span className="text-xs md:text-sm font-medium text-green-500 dark:text-green-400">{yesPercentage.toFixed(1)}%</span>
          <span className="text-xs md:text-sm font-medium text-red-500 dark:text-red-400">{noPercentage.toFixed(1)}%</span>
        </div>

        {isActive && (
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsYesSelected(true)}
                className={`py-2 px-4 md:py-2 md:px-6 rounded-lg transition-colors duration-200 text-xs md:text-sm font-medium ${
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
                className={`py-2 px-4 md:py-2 md:px-6 rounded-lg transition-colors duration-200 text-xs md:text-sm font-medium ${
                  !isYesSelected 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                No
              </motion.button>
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDecrement}
                className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-full p-1 md:p-2"
              >
                <IoRemove size={16} />
              </motion.button>
              <input 
                type="number" 
                value={shareAmount}
                onChange={(e) => setShareAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 md:w-16 text-center border dark:border-navy-600 rounded-lg py-1 md:py-2 bg-white dark:bg-navy-900 text-gray-700 dark:text-gray-300 text-xs md:text-sm"
              />
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleIncrement}
                className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-full p-1 md:p-2"
              >
                <IoAdd size={16} />
              </motion.button>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePredict}
              className="bg-gradient-to-r from-brand-400 to-brand-500 dark:from-brand-500 dark:to-brand-400 text-white rounded-lg py-2 px-4 md:px-6 transition-all duration-200 text-xs md:text-sm font-medium w-full md:w-auto"
            >
              Predict
            </motion.button>
          </div>
        )}

        <motion.button
          onClick={() => setIsInfoExpanded(!isInfoExpanded)}
          className="w-full py-2 bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-center text-xs md:text-sm"
        >
          <span className="mr-1">{isInfoExpanded ? 'Hide' : 'Show'} Details</span>
          {isInfoExpanded ? <IoChevronUpOutline size={12} /> : <IoChevronDownOutline size={12} />}
        </motion.button>

        <AnimatePresence>
          {isInfoExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 text-xs md:text-sm">
                <div className="bg-gray-50 dark:bg-navy-900 p-2 md:p-3 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Minimum Bet</p>
                  <p className="font-semibold text-navy-700 dark:text-white">{formatEth(prediction[5])} ETH</p>
                </div>
                <div className="bg-gray-50 dark:bg-navy-900 p-2 md:p-3 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Maximum Bet</p>
                  <p className="font-semibold text-navy-700 dark:text-white">{formatEth(prediction[6])} ETH</p>
                </div>
                <div className="bg-gray-50 dark:bg-navy-900 p-2 md:p-3 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Total Votes</p>
                  <p className="font-semibold text-navy-700 dark:text-white">{totalVotes}</p>
                </div>
              </div>

              <div className="h-32 md:h-48 mb-4">
                <LineAreaChart chartData={chartData} chartOptions={{}} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin functions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button 
            onClick={() => onFinalize(predictionId, 0n)} 
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
          >
            Finalize Yes
          </button>
          <button 
            onClick={() => onFinalize(predictionId, 1n)} 
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
          >
            Finalize No
          </button>
          <button 
            onClick={() => onCancel(predictionId)} 
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
          >
            Cancel
          </button>
          <button 
            onClick={() => onDistributeRewards(predictionId)} 
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
          >
            Distribute Rewards
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;