'use client'
import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import PredictionCard from 'components/card/PredictionCard';
import { abi } from '../../../abi';
import { parseEther } from 'viem';
import { morphHolesky } from 'viem/chains';

const contractAddress = '0x779d7026FA2100C97AE5E2e8381f6506D5Bf31D4' as const;

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
  const { address, isConnected } = useAccount();

  const { data: predictionCount, refetch: refetchCount } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'predictionCounter',
  });

  const { writeContract } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: undefined, // This will be set when a transaction is made
  });

  useEffect(() => {
    if (predictionCount) {
      const count = Number(predictionCount);
      setPredictionIds(Array.from({ length: count }, (_, i) => BigInt(i)));
    }
  }, [predictionCount]);

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

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">Prediction Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictionIds.map((id) => (
          <PredictionCard
            key={Number(id)}
            predictionId={id}
            usePredictionDetails={usePredictionDetails}
            onPredict={handlePredict}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;