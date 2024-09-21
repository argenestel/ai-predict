import { useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';

// Assuming you have your ABI typed. If not, you should create a typed ABI.
import { abi } from './abi';
import { morphHolesky } from 'viem/chains';

// Contract address
const CONTRACT_ADDRESS = '0x779d7026FA2100C97AE5E2e8381f6506D5Bf31D4' as const;

// Enum definitions
enum PredictionType {
  BINARY,
  MULTIPLE_CHOICE,
  RANGE
}

enum PredictionStatus {
  ACTIVE,
  FINALIZED,
  CANCELLED
}

// Type definitions
type PredictionDetails = {
  description: string;
  endTime: bigint;
  status: PredictionStatus;
  totalVotes: bigint[];
  outcome: bigint;
  minVotes: bigint;
  maxVotes: bigint;
  predictionType: PredictionType;
  creator: `0x${string}`;
  creationTime: bigint;
  tags: string[];
  optionsCount: bigint;
  totalBetAmount: bigint;
};

type UserStats = {
  totalVotes: bigint;
  wonVotes: bigint;
  totalAmountBet: bigint;
  totalAmountWon: bigint;
  luck: bigint;
};

export const usePredictionMarketplace = () => {
  // Read functions
  const { data: predictionCounter, refetch: refetchPredictionCounter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'predictionCounter',
  });

  const getPredictionDetails = useCallback((predictionId: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'getPredictionDetails',
      args: [predictionId],
    });
  }, []);

  const getUserStats = useCallback((userAddress: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'getUserStats',
      args: [userAddress],
    });
  }, []);

  const getLuckiestUsers = useCallback((limit: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'getLuckiestUsers',
      args: [limit],
    });
  }, []);

  const getUserVotes = useCallback((predictionId: bigint, userAddress: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'getUserVotes',
      args: [predictionId, userAddress],
    });
  }, []);

  const hasUserParticipated = useCallback((predictionId: bigint, userAddress: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'hasUserParticipated',
      args: [predictionId, userAddress],
    });
  }, []);

  const calculatePotentialWinnings = useCallback((predictionId: bigint, option: bigint, votes: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'calculatePotentialWinnings',
      args: [predictionId, option, votes],
    });
  }, []);

  // Write functions
  const { writeContract } = useWriteContract();
  const { address } = useAccount();

  const createPrediction = useCallback((
    description: string,
    duration: bigint,
    minVotes: bigint,
    maxVotes: bigint,
    predictionType: PredictionType,
    optionsCount: bigint,
    tags: string[]
  ) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'createPrediction',
        args: [description, duration, minVotes, maxVotes, predictionType, optionsCount, tags],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const placeVotes = useCallback((predictionId: bigint, option: bigint, votes: bigint) => {
    const value = parseEther((Number(votes) * 0.001).toString());
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'placeVotes',
        args: [predictionId, option, votes],
        value,
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const partialWithdraw = useCallback((predictionId: bigint, votes: bigint) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'partialWithdraw',
        args: [predictionId, votes],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const finalizePrediction = useCallback((predictionId: bigint, outcome: bigint) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'finalizePrediction',
        args: [predictionId, outcome],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const distributeRewards = useCallback((predictionId: bigint) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'distributeRewards',
        args: [predictionId],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const cancelPrediction = useCallback((predictionId: bigint) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'cancelPrediction',
        args: [predictionId],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const withdrawFees = useCallback((to: `0x${string}`, amount: bigint) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'withdrawFees',
        args: [to, amount],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const addValidTag = useCallback((tag: string) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'addValidTag',
        args: [tag],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const removeValidTag = useCallback((tag: string) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'removeValidTag',
        args: [tag],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  // Role management functions
  const grantPredictorRole = useCallback((account: `0x${string}`) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'grantPredictorRole',
        args: [account],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const revokePredictorRole = useCallback((account: `0x${string}`) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'revokePredictorRole',
        args: [account],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const grantModRole = useCallback((account: `0x${string}`) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'grantModRole',
        args: [account],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const revokeModRole = useCallback((account: `0x${string}`) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'revokeModRole',
        args: [account],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const grantOracleRole = useCallback((account: `0x${string}`) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'grantOracleRole',
        args: [account],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  const revokeOracleRole = useCallback((account: `0x${string}`) => {
    return writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'revokeOracleRole',
        args: [account],
        chain: morphHolesky,
        account: address as `0x${string}`
    });
  }, [writeContract]);

  return {
    // Read functions
    predictionCounter,
    getPredictionDetails,
    getUserStats,
    getLuckiestUsers,
    getUserVotes,
    hasUserParticipated,
    calculatePotentialWinnings,
    refetchPredictionCounter,

    // Write functions
    createPrediction,
    placeVotes,
    partialWithdraw,
    finalizePrediction,
    distributeRewards,
    cancelPrediction,
    withdrawFees,
    addValidTag,
    removeValidTag,

    // Role management functions
    grantPredictorRole,
    revokePredictorRole,
    grantModRole,
    revokeModRole,
    grantOracleRole,
    revokeOracleRole,
  };
};