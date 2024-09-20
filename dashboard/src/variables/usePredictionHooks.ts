// 'use client'
// import { useAccount, useReadContract, useWriteContract } from 'wagmi';
// import { parseEther, Address } from 'viem';
// import { abi } from '../abi';
// import { morphHolesky } from 'viem/chains';

// // Replace with your actual contract address
// const CONTRACT_ADDRESS = '0x48B6DC067CF2b7219530Bc76be1986Fd22F411D9' as const;

// // Helper function to handle BigInt conversion
// const toBigInt = (value: number | string) => BigInt(value);

// export function usePredictionMarketplace() {
//   const { writeContract } = useWriteContract();
//   const { address } = useAccount();

//   const createPrediction = (description: string, duration: number, minimumBet: string, maximumBet: string, optionsCount: number) => {
//     writeContract({
//       address: CONTRACT_ADDRESS,
//       abi,
//       functionName: 'createPrediction',
//       args: [description, toBigInt(duration), parseEther(minimumBet), parseEther(maximumBet), toBigInt(optionsCount)],
//       chain: morphHolesky,
//       account: address as `0x${string}`
//     });
//   };

//   const placeBet = (predictionId: number, option: number, amount: string) => {
//     writeContract({
//       address: CONTRACT_ADDRESS,
//       abi,
//       functionName: 'placeBet',
//       args: [toBigInt(predictionId), toBigInt(option)],
//       value: parseEther(amount),
//       chain: morphHolesky,
//       account: address as `0x${string}`
//     });
//   };

//   const finalizePrediction = (predictionId: number, outcome: number) => {
//     writeContract({
//       address: CONTRACT_ADDRESS,
//       abi,
//       functionName: 'finalizePrediction',
//       args: [toBigInt(predictionId), toBigInt(outcome)],
//       chain: morphHolesky,
//       account: address as `0x${string}`
//     });
//   };

//   const cancelPrediction = (predictionId: number) => {
//     writeContract({
//       address: CONTRACT_ADDRESS,
//       abi,
//       functionName: 'cancelPrediction',
//       args: [toBigInt(predictionId)],
//       chain: morphHolesky,
//       account: address as `0x${string}`
//     });
//   };

//   const claimReward = (predictionId: number) => {
//     writeContract({
//       address: CONTRACT_ADDRESS,
//       abi,
//       functionName: 'claimReward',
//       args: [toBigInt(predictionId)],
//       chain: morphHolesky,
//       account: address as `0x${string}`
//     });
//   };

//   const addValidTag = (tag: string) => {
//     writeContract({
//       address: CONTRACT_ADDRESS,
//       abi,
//       functionName: 'addValidTag',
//       args: [tag],
//       chain: morphHolesky,
//       account: address as `0x${string}`
//     });
//   };

//   const removeValidTag = (tag: string) => {
//     writeContract({
//       address: CONTRACT_ADDRESS,
//       abi,
//       functionName: 'removeValidTag',
//       args: [tag],
//       chain: morphHolesky,
//       account: address as `0x${string}`
//     });
//   };

//   const vote = (predictionId: number) => {
//     writeContract({
//       address: CONTRACT_ADDRESS,
//       abi,
//       functionName: 'vote',
//       args: [toBigInt(predictionId)],
//       chain: morphHolesky,
//       account: address as `0x${string}`
//     });
//   };

//   return {
//     createPrediction,
//     placeBet,
//     finalizePrediction,
//     cancelPrediction,
//     claimReward,
//     addValidTag,
//     removeValidTag,
//     vote
//   };
// }

// export function usePredictionDetails(predictionId: number) {
//   const { address } = useAccount();
//   const { data, error, isLoading } = useReadContract({
//     address: CONTRACT_ADDRESS,
//     abi,
//     functionName: 'getPredictionDetails',
//     args: [toBigInt(predictionId)],
//     account: address,
//   });

//   return {
//     predictionDetails: data,
//     error,
//     isLoading,
//   };
// }

// export function useUserBet(predictionId: number, option: number) {
//   const { address } = useAccount();
//   const { data, error, isLoading } = useReadContract({
//     address: CONTRACT_ADDRESS,
//     abi,
//     functionName: 'getUserBet',
//     args: [toBigInt(predictionId), address, toBigInt(option)],
//     account: address,
//   });

//   return {
//     userBet: data,
//     error,
//     isLoading,
//   };
// }

// export function useHasUserVoted(predictionId: number) {
//   const { address } = useAccount();
//   const { data, error, isLoading } = useReadContract({
//     address: CONTRACT_ADDRESS,
//     abi,
//     functionName: 'hasUserVoted',
//     args: [toBigInt(predictionId), address],
//     account: address,
//   });

//   return {
//     hasVoted: data,
//     error,
//     isLoading,
//   };
// }

// export function useValidTag(tag: string) {
//   const { address } = useAccount();
//   const { data, error, isLoading } = useReadContract({
//     address: CONTRACT_ADDRESS,
//     abi,
//     functionName: 'validTags',
//     args: [tag],
//     account: address,
//   });

//   return {
//     isValidTag: data,
//     error,
//     isLoading,
//   };
// }

// export function usePredictionCounter() {
//   const { address } = useAccount();
//   const { data, error, isLoading } = useReadContract({
//     address: CONTRACT_ADDRESS,
//     abi,
//     functionName: 'predictionCounter',
//     account: address,
//   });

//   return {
//     predictionCounter: data,
//     error,
//     isLoading,
//   };
// }