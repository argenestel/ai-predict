import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { usePredictionMarketplace } from 'usePredictionHook';
import { abi } from 'abi';

interface AdminFunctionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_ROLE = '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775';
const PREDICTOR_ROLE = '0xfe9eaad5f5acc86dfc672d62b2c2acc0fccbdc369951a11924b882e2c44ed506';

const AdminFunctionsModal: React.FC<AdminFunctionsModalProps> = ({ isOpen, onClose }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPredictor, setIsPredictor] = useState(false);
  const { address } = useAccount();
  const { user } = useDynamicContext();
  const {
    createPrediction,
    finalizePrediction,
    cancelPrediction,
    distributeRewards,
    withdrawFees,
    addValidTag,
    removeValidTag,
    grantPredictorRole,
    revokePredictorRole,
    grantModRole,
    revokeModRole,
    grantOracleRole,
    revokeOracleRole,
  } = usePredictionMarketplace();

  // State for input fields
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [tagName, setTagName] = useState('');
  const [roleAddress, setRoleAddress] = useState('');
  const [predictionDetails, setPredictionDetails] = useState({
    description: '',
    duration: '',
    minVotes: '',
    maxVotes: '',
    predictionType: '0',
    optionsCount: '',
    tags: '',
  });
  const [predictionId, setPredictionId] = useState('');
  const [outcome, setOutcome] = useState('');

  const { data: hasAdminRole } = useReadContract({
    address: '0x779d7026FA2100C97AE5E2e8381f6506D5Bf31D4',
    abi: abi,
    functionName: 'hasRole',
    args: [address as `0x${string}`, ADMIN_ROLE],
  });

  const { data: hasPredictorRole } = useReadContract({
    address: '0x779d7026FA2100C97AE5E2e8381f6506D5Bf31D4',
    abi: abi,
    functionName: 'hasRole',
    args: [address as `0x${string}`, PREDICTOR_ROLE],
  });

  useEffect(() => {
    const checkRoles = async () => {
      if (user && address) {
        const adminRole = await hasAdminRole;
        const predictorRole = await hasPredictorRole;
        setIsAdmin(!!adminRole);
        setIsPredictor(!!predictorRole);
      } else {
        setIsAdmin(false);
        setIsPredictor(false);
      }
    };

    checkRoles();
  }, [user, address, hasAdminRole, hasPredictorRole]);

  if (!isOpen) return null;

  const handleCreatePrediction = () => {
    createPrediction(
      predictionDetails.description,
      BigInt(predictionDetails.duration),
      BigInt(predictionDetails.minVotes),
      BigInt(predictionDetails.maxVotes),
      parseInt(predictionDetails.predictionType),
      BigInt(predictionDetails.optionsCount),
      predictionDetails.tags.split(',').map(tag => tag.trim())
    );
  };

  return (
    <AnimatePresence>
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
          className="bg-white dark:bg-navy-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-navy-700 dark:text-white">Admin Functions</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <IoClose size={24} />
            </button>
          </div>

          {isAdmin && (
            <>
              <h3 className="text-lg font-semibold mb-2 text-navy-700 dark:text-white">Admin Functions</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Amount to withdraw"
                    className="w-full p-2 border rounded dark:bg-navy-700 dark:border-navy-600"
                  />
                  <button onClick={() => withdrawFees(address as `0x${string}`, BigInt(withdrawAmount))} className="w-full mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                    Withdraw Fees
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Tag name"
                    className="w-full p-2 border rounded dark:bg-navy-700 dark:border-navy-600"
                  />
                  <button onClick={() => addValidTag(tagName)} className="w-full mt-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors">
                    Add Valid Tag
                  </button>
                  <button onClick={() => removeValidTag(tagName)} className="w-full mt-2 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors">
                    Remove Valid Tag
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    value={roleAddress}
                    onChange={(e) => setRoleAddress(e.target.value)}
                    placeholder="Address"
                    className="w-full p-2 border rounded dark:bg-navy-700 dark:border-navy-600"
                  />
                  <button onClick={() => grantPredictorRole(roleAddress as `0x${string}`)} className="w-full mt-2 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition-colors">
                    Grant Predictor Role
                  </button>
                  <button onClick={() => revokePredictorRole(roleAddress as `0x${string}`)} className="w-full mt-2 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition-colors">
                    Revoke Predictor Role
                  </button>
                  <button onClick={() => grantModRole(roleAddress as `0x${string}`)} className="w-full mt-2 bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 transition-colors">
                    Grant Mod Role
                  </button>
                  <button onClick={() => revokeModRole(roleAddress as `0x${string}`)} className="w-full mt-2 bg-pink-500 text-white py-2 px-4 rounded hover:bg-pink-600 transition-colors">
                    Revoke Mod Role
                  </button>
                  <button onClick={() => grantOracleRole(roleAddress as `0x${string}`)} className="w-full mt-2 bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600 transition-colors">
                    Grant Oracle Role
                  </button>
                  <button onClick={() => revokeOracleRole(roleAddress as `0x${string}`)} className="w-full mt-2 bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors">
                    Revoke Oracle Role
                  </button>
                </div>
              </div>
            </>
          )}

          {isPredictor && (
            <>
              <h3 className="text-lg font-semibold mt-4 mb-2 text-navy-700 dark:text-white">Predictor Functions</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={predictionDetails.description}
                    onChange={(e) => setPredictionDetails({...predictionDetails, description: e.target.value})}
                    placeholder="Description"
                    className="w-full p-2 border rounded dark:bg-navy-700 dark:border-navy-600"
                  />
                  <input
                    type="number"
                    value={predictionDetails.duration}
                    onChange={(e) => setPredictionDetails({...predictionDetails, duration: e.target.value})}
                    placeholder="Duration (seconds)"
                    className="w-full mt-2 p-2 border rounded dark:bg-navy-700 dark:border-navy-600"
                  />
                  <input
                    type="number"
                    value={predictionDetails.minVotes}
                    onChange={(e) => setPredictionDetails({...predictionDetails, minVotes: e.target.value})}
                    placeholder="Min Votes"
                    className="w-full mt-2 p-2 border rounded dark:bg-navy-700 dark:border-navy-600"
                  />
                  <input
                    type="number"
                    value={predictionDetails.maxVotes}
                    onChange={(e) => setPredictionDetails({...predictionDetails, maxVotes: e.target.value})}
                    placeholder="Max Votes"
                    className="w-full mt-2 p-2 border rounded dark:bg-navy-700 dark:border-navy-600"
                  />
                  <select
                    value={predictionDetails.predictionType}
                    onChange={(e) => setPredictionDetails({...predictionDetails, predictionType: e.target.value})}
                    className="w-full mt-2 p-2 border rounded dark:bg-navy-700 dark:border-navy-600"
                  >
                    <option value="0">Binary</option>
                    <option value="1">Multiple Choice</option>
                    <option value="2">Range</option>
                  </select>
                  <input
                    type="number"
                    value={predictionDetails.optionsCount}
                    onChange={(e) => setPredictionDetails({...predictionDetails, optionsCount: e.target.value})}
                    placeholder="Options Count"
                    className="w-full mt-2 p-2 border rounded dark:bg-navy-700 dark:border-navy-600"
                  />
                  <input
                    type="text"
                    value={predictionDetails.tags}
                    onChange={(e) => setPredictionDetails({...predictionDetails, tags: e.target.value})}
                    placeholder="Tags (comma-separated)"
                    className="w-full mt-2 p-2 border rounded dark:bg-navy-700 dark:border-navy-600"
                  />
                  <button onClick={handleCreatePrediction} className="w-full mt-2 bg-cyan-500 text-white py-2 px-4 rounded hover:bg-cyan-600 transition-colors">
                    Create Prediction
                  </button>
                </div>
                <div>
                  <input
                    type="number"
                    value={predictionId}
                    onChange={(e) => setPredictionId(e.target.value)}
                    placeholder="Prediction ID"
                    className="w-full p-2 border rounded dark:bg-navy-700 dark:border-navy-600"
                  />
                  <input
                    type="number"
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    placeholder="Outcome"
                    className="w-full mt-2 p-2 border rounded dark:bg-navy-700 dark:border-navy-600"
                  />
                  <button onClick={() => finalizePrediction(BigInt(predictionId), BigInt(outcome))} className="w-full mt-2 bg-emerald-500 text-white py-2 px-4 rounded hover:bg-emerald-600 transition-colors">
                    Finalize Prediction
                  </button>
                  <button onClick={() => cancelPrediction(BigInt(predictionId))} className="w-full mt-2 bg-rose-500 text-white py-2 px-4 rounded hover:bg-rose-600 transition-colors">
                    Cancel Prediction
                  </button>
                  <button onClick={() => distributeRewards(BigInt(predictionId))} className="w-full mt-2 bg-amber-500 text-white py-2 px-4 rounded hover:bg-amber-600 transition-colors">
                    Distribute Rewards
                  </button>
                </div>
              </div>
            </>
          )}

          {!isAdmin && !isPredictor && (
            <p className="text-center text-gray-600 dark:text-gray-400">You don't have admin or predictor privileges.</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminFunctionsModal;