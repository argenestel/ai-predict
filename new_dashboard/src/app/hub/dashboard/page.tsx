'use client'
import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import PredictionCard from 'components/card/PredictionCard';
import { abi } from '../../../abi';
import { parseEther } from 'viem';
import AdminFunctionsModal from 'components/card/AdminModal';
import { morphHolesky } from 'viem/chains';

const contractAddress = '0x779d7026FA2100C97AE5E2e8381f6506D5Bf31D4' as const;
const ADMIN_ROLE = '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775';
const PREDICTOR_ROLE = '0xfe9eaad5f5acc86dfc672d62b2c2acc0fccbdc369951a11924b882e2c44ed506';

const Dashboard: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [hasAdminOrPredictorRole, setHasAdminOrPredictorRole] = useState(false);
  const { address } = useAccount();

  const { data: predictionCount, refetch: refetchCount } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'predictionCounter',
  });

  const { data: hasAdminRole } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'hasRole',
    args: [ADMIN_ROLE, address as `0x${string}`],
  });

  const { data: hasPredictorRole } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'hasRole',
    args: [PREDICTOR_ROLE, address as `0x${string}`],
  });

  const { writeContract } = useWriteContract();

  const getPredictionDetails = async (id: bigint) => {
    const { data } = await useReadContract({
      address: contractAddress,
      abi: abi,
      functionName: 'getPredictionDetails',
      args: [id],
    });
    return data;
  };

  useEffect(() => {
    const fetchAllPredictions = async () => {
      if (predictionCount) {
        const count = Number(predictionCount);
        const fetchedPredictions = [];
        for (let i = 0; i < count; i++) {
          const result = await getPredictionDetails(BigInt(i));
          if (result) {
            fetchedPredictions.push(result);
          }
        }
        setPredictions(fetchedPredictions);
      }
    };

    fetchAllPredictions();
  }, [predictionCount]);

  useEffect(() => {
    if (hasAdminRole !== morphHolesky || hasPredictorRole !== morphHolesky) {
      setHasAdminOrPredictorRole(!!hasAdminRole || !!hasPredictorRole);
    }
  }, [hasAdminRole, hasPredictorRole]);

  const handlePredict = async (id: number, isYes: boolean, amount: number) => {
    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'placeVotes',
        args: [BigInt(id), isYes ? 0n : 1n, BigInt(amount)],
        value: parseEther((amount * 0.001).toString()),
        chain: morphHolesky,
        account: address as `0x${string}`
      });
      console.log(`Prediction made for ${id}: ${isYes ? 'Yes' : 'No'}, Amount: ${amount}`);
      refetchCount();
    } catch (error) {
      console.error('Error making prediction:', error);
    }
  };

  const handleFinalize = async (id: number, outcome: bigint) => {
    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'finalizePrediction',
        args: [BigInt(id), outcome],
        chain: morphHolesky,
        account: address as `0x${string}`
      });
      console.log(`Finalize prediction ${id} with outcome ${outcome}`);
      refetchCount();
    } catch (error) {
      console.error('Error finalizing prediction:', error);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'cancelPrediction',
        args: [BigInt(id)],
        chain: morphHolesky,
        account: address as `0x${string}`
      });
      console.log(`Cancel prediction ${id}`);
      refetchCount();
    } catch (error) {
      console.error('Error cancelling prediction:', error);
    }
  };

  const handleDistributeRewards = async (id: number) => {
    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'distributeRewards',
        args: [BigInt(id)],
        chain: morphHolesky,
        account: address as `0x${string}`
      });
      console.log(`Distribute rewards for prediction ${id}`);
      refetchCount();
    } catch (error) {
      console.error('Error distributing rewards:', error);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Dashboard</h1>
        {hasAdminOrPredictorRole && (
          <button 
            onClick={() => setIsAdminModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Admin Functions
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictions.map((prediction, index) => (
          <PredictionCard
            key={index}
            predictionId={BigInt(index)}
            getPredictionDetails={() => getPredictionDetails(BigInt(index))}
            onPredict={handlePredict}
            onFinalize={handleFinalize}
            onCancel={handleCancel}
            onDistributeRewards={handleDistributeRewards}
            prediction={prediction}
          />
        ))}
      </div>

      {hasAdminOrPredictorRole && (
        <AdminFunctionsModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;

function BigInt(id: number): unknown {
  throw new Error('Function not implemented.');
}
