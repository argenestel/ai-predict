'use client'
import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import PredictionCard from 'components/card/PredictionCard';
import { abi } from '../../../abi';
import { parseEther } from 'viem';
import { morphHolesky } from 'viem/chains';
import {config} from 'config';
const contractAddress = '0x779d7026FA2100C97AE5E2e8381f6506D5Bf31D4' as const;

const Dashboard: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [currentPredictionId, setCurrentPredictionId] = useState<bigint | null>(null);
  const { address } = useAccount();

  const { data: predictionCount, refetch: refetchCount } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'predictionCounter',
  });

  const { data: predictionDetails } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'getPredictionDetails',
    args: currentPredictionId !== null ? [currentPredictionId] : [BigInt(0)]
  });

  const { writeContract } = useWriteContract({
    config
  });

  useEffect(() => {
    const fetchAllPredictions = async () => {
      if (predictionCount) {
        const count = Number(predictionCount);
        const fetchedPredictions = [];
        for (let i = 0; i < count; i++) {
          setCurrentPredictionId(BigInt(i));
          console.log(predictionDetails);
          if (predictionDetails) {
            fetchedPredictions.push(predictionDetails);
          }
        }
        setPredictions(fetchedPredictions);
        setCurrentPredictionId(null);
      }
    };

    fetchAllPredictions();
  }, [predictionCount, predictionDetails]);

  const handlePredict = async (id: number, isYes: boolean, amount: number) => {
    console.log(address);
    try {
      writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'placeVotes',
        args: [BigInt(id), isYes ? BigInt(0) : BigInt(1), BigInt(amount)],
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

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictions.map((prediction, index) => (
          <PredictionCard
            key={index}
            predictionId={BigInt(index)}
            getPredictionDetails={async () => setCurrentPredictionId(BigInt(index))}
            onPredict={handlePredict}
            prediction={prediction}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;