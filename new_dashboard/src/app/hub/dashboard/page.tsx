'use client'
import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { IoAdd, IoClose } from 'react-icons/io5';
import PredictionCard from 'components/card/PredictionCard';
import { abi } from '../../../abi';
import { parseEther } from 'viem';
import { morphHolesky } from 'viem/chains';

const contractAddress = '0x779d7026FA2100C97AE5E2e8381f6506D5Bf31D4' as const;
const PREDICTOR_ROLE = '0xfe9eaad5f5acc86dfc672d62b2c2acc0fccbdc369951a11924b882e2c44ed506';

const usePredictionDetails = (id: bigint) => {
  return useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'getPredictionDetails',
    args: [id],
  });
};

const Dashboard: React.FC = () => {
  const [predictionIds, setPredictionIds] = useState<bigint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const [isPredictorRole, setIsPredictorRole] = useState(false);

  const { data: predictionCount, refetch: refetchCount } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'predictionCounter',
  });

  const { data: hasPredictorRole } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'hasRole',
    args: [PREDICTOR_ROLE, address as `0x${string}`],
  });

  const { writeContract } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  useEffect(() => {
    if (predictionCount) {
      const count = Number(predictionCount);
      setPredictionIds(Array.from({ length: count }, (_, i) => BigInt(i)));
    }
  }, [predictionCount]);

  useEffect(() => {
    if (hasPredictorRole !== undefined) {
      setIsPredictorRole(!!hasPredictorRole);
    }
  }, [hasPredictorRole]);

  const handlePredict = async (id: number, isYes: boolean, amount: number) => {
    if (!isConnected || !address) {
      console.error('Wallet not connected');
      return;
    }

    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'placeVotes',
        args: [BigInt(id), isYes ? BigInt(0) : BigInt(1), BigInt(amount)],
        value: parseEther((amount * 0.001).toString()),
        chain: morphHolesky,
        account: address
      });
    } catch (error) {
      console.error('Error making prediction:', error);
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      refetchCount();
    }
  }, [isConfirmed, refetchCount]);

  const [newPrediction, setNewPrediction] = useState({
    description: '',
    duration: '',
    minVotes: '',
    maxVotes: '',
    predictionType: '0',
    optionsCount: '2',
    tags: '',
  });

  const handleCreatePrediction = async () => {
    if (!isConnected || !address) {
      console.error('Wallet not connected');
      return;
    }

    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'createPrediction',
        args: [
          newPrediction.description,
          BigInt(newPrediction.duration),
          BigInt(newPrediction.minVotes),
          BigInt(newPrediction.maxVotes),
          parseInt(newPrediction.predictionType),
          BigInt(newPrediction.optionsCount),
          newPrediction.tags.split(',').map(tag => tag.trim())
        ],
        chain: morphHolesky,
        account: address
      });
      setIsModalOpen(false);
      setNewPrediction({
        description: '',
        duration: '',
        minVotes: '',
        maxVotes: '',
        predictionType: '0',
        optionsCount: '2',
        tags: '',
      });
    } catch (error) {
      console.error('Error creating prediction:', error);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Prediction Dashboard</h1>
        {isPredictorRole && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-500 text-white rounded-lg py-2 px-4 flex items-center"
          >
            <IoAdd className="mr-2" /> Create Prediction
          </motion.button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictionIds.map((id) => (
          <PredictionCard
            key={Number(id)}
            predictionId={id}
            usePredictionDetails={usePredictionDetails}
            onPredict={handlePredict} contractAddress={contractAddress} abi={abi}          />
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:text-white dark:bg-navy-800 rounded-lg p-6 w-full max-w-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-navy-700 dark:text-white">Create New Prediction</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <IoClose size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newPrediction.description}
                  onChange={(e) => setNewPrediction({...newPrediction, description: e.target.value})}
                  placeholder="Description"
                  className="w-full p-2 border rounded dark:text-white dark:bg-navy-700 dark:border-navy-600"
                />
                <input
                  type="number"
                  value={newPrediction.duration}
                  onChange={(e) => setNewPrediction({...newPrediction, duration: e.target.value})}
                  placeholder="Duration (seconds)"
                  className="w-full p-2 border rounded dark:text-white dark:bg-navy-700 dark:border-navy-600"
                />
                <input
                  type="number"
                  value={newPrediction.minVotes}
                  onChange={(e) => setNewPrediction({...newPrediction, minVotes: e.target.value})}
                  placeholder="Min Votes"
                  className="w-full p-2 border rounded dark:text-white dark:bg-navy-700 dark:border-navy-600"
                />
                <input
                  type="number"
                  value={newPrediction.maxVotes}
                  onChange={(e) => setNewPrediction({...newPrediction, maxVotes: e.target.value})}
                  placeholder="Max Votes"
                  className="w-full p-2 border rounded dark:text-white dark:bg-navy-700 dark:border-navy-600"
                />
                <select
                  value={newPrediction.predictionType}
                  onChange={(e) => setNewPrediction({...newPrediction, predictionType: e.target.value})}
                  className="w-full p-2 border rounded dark:text-white dark:bg-navy-700 dark:border-navy-600"
                >
                  <option className='dark:text-white' value="0">Binary</option>
                  <option className='dark:text-white' value="1">Multiple Choice</option>
                  <option className='dark:text-white' value="2">Range</option>
                </select>
                <input
                  type="number"
                  value={newPrediction.optionsCount}
                  onChange={(e) => setNewPrediction({...newPrediction, optionsCount: e.target.value})}
                  placeholder="Options Count"
                  className="w-full p-2 border rounded dark:bg-navy-700 dark:text-white dark:border-navy-600"
                />
                <input
                  type="text"
                  value={newPrediction.tags}
                  onChange={(e) => setNewPrediction({...newPrediction, tags: e.target.value})}
                  placeholder="Tags (comma-separated)"
                  className="w-full p-2 border rounded dark:bg-navy-700 dark:text-white dark:border-navy-600"
                />
                <button
                  onClick={handleCreatePrediction}
                  className="w-full bg-brand-500 text-white rounded-lg py-2 px-4 hover:bg-brand-600 transition-colors"
                >
                  Create Prediction
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;