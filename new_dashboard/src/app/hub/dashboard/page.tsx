'use client';
import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import PredictionCard from 'components/card/PredictionCard';
import { abi } from '../../../abi';

const contractAddress = '0x779d7026FA2100C97AE5E2e8381f6506D5Bf31D4';

const Dashboard = () => {
  const [predictions, setPredictions] = useState<any[]>([]);

  // Prediction Count Read
  const { data: predictionCount, refetch: refetchCount } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'predictionCounter',
  });

  // Fetch prediction details
  const fetchPredictionDetails = async (id: number) => {
    const { data } = await useReadContract({
      address: contractAddress,
      abi: abi,
      functionName: 'getPredictionDetails',
      args: [BigInt(id)],
    });
    return data;
  };

  useEffect(() => {
    const fetchAllPredictions = async () => {
      if (predictionCount) {
        const count = Number(predictionCount);
        const fetchedPredictions = [];
        for (let i = 0; i < count; i++) {
          const details = await fetchPredictionDetails(i);
          fetchedPredictions.push(details);
        }
        setPredictions(fetchedPredictions);
      }
    };

    fetchAllPredictions();
  }, [predictionCount]);

  const handlePredict = (id: number, isYes: boolean, amount: number) => {
    console.log(`Prediction made for ${id}: ${isYes ? 'Yes' : 'No'}, Amount: ${amount}`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 text-navy-700 dark:text-white">Dashboard</h1>

      {/* Contract Interaction */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Contract Interaction:</h2>
        <div className="flex items-center space-x-4 mb-4">
          <button 
            onClick={() => refetchCount()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Refresh Prediction Count
          </button>
          <p>Count: {predictionCount ? predictionCount.toString() : 'N/A'}</p>
        </div>
      </div>

      {/* PredictionCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictions.map((prediction, index) => (
          <PredictionCard
            key={index}
            predictionId={BigInt(index)}
            getPredictionDetails={fetchPredictionDetails}
            onPredict={handlePredict}
            onFinalize={(id, outcome) => console.log(`Finalize prediction ${id} with outcome ${outcome}`)}
            onCancel={(id) => console.log(`Cancel prediction ${id}`)}
            onDistributeRewards={(id) => console.log(`Distribute rewards for prediction ${id}`)}
            prediction={prediction}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;