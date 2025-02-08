import React, { useState, useCallback } from 'react';
import { ChevronDown, Settings, ArrowUpDown, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { BrowserProvider, Contract } from 'ethers';

// Transaction steps component
const TransactionProgress = ({ isOpen, currentStep }) => {
  if (!isOpen) return null;

  const steps = [
    "Query submitted to the agent",
    "Agents finding best venue for swaps",
    "Agents finding the best route for swaps",
    "Agents submitting the best route",
    "Agent auction",
    "Swapping according to winning route",
    "Swap completed"
  ];

  const getStepStatus = (index) => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "pending";
  };

  return (
    <div className="absolute inset-0 backdrop-blur-sm">
      <div className="bg-gray-900/95 rounded-3xl border border-purple-900/30 shadow-lg shadow-purple-500/10 p-6 w-full h-full">
        <h3 className="text-xl font-medium text-gray-100 mb-6">Transaction Progress</h3>
        <div className="relative">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start mb-8 relative">
              <div className="flex items-center">
                <div className="mr-4 flex items-center justify-center">
                  <div className="text-gray-400 w-6">{index + 1}</div>
                </div>
                <div className={`flex-1 ${
                  getStepStatus(index) === 'completed' ? 'text-purple-400' :
                  getStepStatus(index) === 'current' ? 'text-gray-100' :
                  'text-gray-500'
                }`}>
                  <div className="flex items-center gap-3">
                    {getStepStatus(index) === 'completed' && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
                    {getStepStatus(index) === 'current' && <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />}
                    {getStepStatus(index) === 'pending' && <Circle className="w-5 h-5" />}
                    {step}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`absolute left-[2.5rem] top-8 w-px h-8 ${
                  getStepStatus(index) === 'completed' ? 'bg-purple-400' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const tokensList = [
  { name: 'Ethereum', symbol: 'ETH', icon: '◊' },
  { name: 'USD Coin', symbol: 'USDC', icon: '$' },
  { name: 'Tether', symbol: 'USDT', icon: 'T' },
  { name: 'Arbitrum', symbol: 'ARB', icon: 'A' },
  { name: 'Polygon', symbol: 'MATIC', icon: 'P' },
];

const chainsList = [
  { name: 'Ethereum', icon: '◊', id: 'ethereum' },
  { name: 'Polygon', icon: 'P', id: 'polygon' },
  { name: 'Base', icon: 'B', id: 'base' },
  { name: 'Arbitrum', icon: 'A', id: 'arbitrum' },
];

const contractABI = [
  {
    "inputs": [],
    "name": "increase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const App = () => {
  // Existing states
  const [userAddress, setUserAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [fromTokenDropdownOpen, setFromTokenDropdownOpen] = useState(false);
  const [toTokenDropdownOpen, setToTokenDropdownOpen] = useState(false);
  const [fromChainDropdownOpen, setFromChainDropdownOpen] = useState(false);
  const [toChainDropdownOpen, setToChainDropdownOpen] = useState(false);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(tokensList[0]);
  const [toToken, setToToken] = useState(tokensList[1]);
  const [fromChain, setFromChain] = useState(chainsList[0]);
  const [toChain, setToChain] = useState(chainsList[1]);
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionError, setTransactionError] = useState(null);

  // New states for transaction progress
  const [showTransactionProgress, setShowTransactionProgress] = useState(false);
  const [currentTransactionStep, setCurrentTransactionStep] = useState(0);

  // Simulate transaction progress
  const simulateTransactionProgress = async () => {
    setShowTransactionProgress(true);
    setCurrentTransactionStep(0);
    
    for (let i = 0; i < 7; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between steps
      setCurrentTransactionStep(i + 1);
    }
    
    setTimeout(() => {
      setShowTransactionProgress(false);
      setCurrentTransactionStep(0);
      setIsTransacting(false);
    }, 2000);
  };

  // Modified handleSwap function
  const handleSwap = async () => {
    setIsTransacting(true);
    setTransactionError(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = "0xEA912a237E63fB159A11c5C01A93bD3677248b34";
      const contract = new Contract(contractAddress, contractABI, signer);
      
      const transaction = await contract.increase();
      simulateTransactionProgress(); // Start progress simulation after transaction is initiated
      
      const receipt = await transaction.wait();
      console.log('Transaction successful:', receipt);
      
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Transaction failed:', error);
      setTransactionError(error.message);
      setIsTransacting(false);
      setShowTransactionProgress(false);
    }
  };

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        console.log('Connected address:', address);
        setUserAddress(address);
        setIsWalletConnected(true);
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  };

  const handleSwapDirection = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);

    const tempChain = fromChain;
    setFromChain(toChain);
    setToChain(tempChain);

    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const TokenDropdown = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;
    
    return (
      <div className="absolute z-50 mt-2 w-64 bg-gray-900/95 backdrop-blur-md rounded-2xl border border-purple-900/30 shadow-lg shadow-purple-500/10">
        <div className="p-4 border-b border-gray-800">
          <input
            type="text"
            placeholder="Search tokens"
            className="w-full bg-gray-800 text-gray-100 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-400/20"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {tokensList.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center gap-3 px-4 py-3 hover:bg-purple-400/5 cursor-pointer group"
              onClick={() => {
                onSelect(token);
                onClose();
              }}
            >
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-lg">
                {token.icon}
              </div>
              <div>
                <div className="text-gray-100 group-hover:text-purple-400 transition-colors">
                  {token.symbol}
                </div>
                <div className="text-gray-500 text-sm">{token.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ChainDropdown = ({ isOpen, onClose, onSelect, selectedChain }) => {
    if (!isOpen) return null;
    
    return (
      <div className="absolute z-50 mt-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-2xl border border-purple-900/30 shadow-lg shadow-purple-500/10 right-0">
        {chainsList.map((chain) => (
          <div
            key={chain.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-purple-400/5 cursor-pointer group"
            onClick={() => {
              onSelect(chain);
              onClose();
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-lg">
              {chain.icon}
            </div>
            <div className="text-gray-100 group-hover:text-purple-400 transition-colors">
              {chain.name}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const SwapField = ({ 
    label, 
    token, 
    chain,
    amount,
    setAmount,
    isTokenDropdownOpen,
    isChainDropdownOpen,
    setTokenDropdownOpen,
    setChainDropdownOpen,
    onTokenSelect,
    onChainSelect
  }) => (
    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/30 relative">
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-400 text-sm">{label}</div>
        <div className="text-gray-400 text-sm">Balance: 0.0</div>
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <style>
          {`
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }

            input[type=number] {
              -moz-appearance: textfield;
            }
          `}
        </style>
        <input 
          type="number" 
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-transparent text-3xl text-gray-100 outline-none w-1/2 font-light"
        />
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              className="flex items-center gap-2 bg-gray-700/50 hover:bg-purple-400/10 px-4 py-2 rounded-full transition-all duration-300 border border-gray-700/50 hover:border-purple-400/50 group"
              onClick={() => setTokenDropdownOpen(!isTokenDropdownOpen)}
            >
              {token ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                    {token.icon}
                  </div>
                  <span className="text-gray-100 group-hover:text-purple-400">{token.symbol}</span>
                </>
              ) : (
                <span className="text-gray-100 group-hover:text-purple-400">Select</span>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
            </button>
            <TokenDropdown 
              isOpen={isTokenDropdownOpen}
              onClose={() => setTokenDropdownOpen(false)}
              onSelect={onTokenSelect}
            />
          </div>
          
          <div className="relative">
            <button 
              className="flex items-center gap-2 bg-gray-700/50 hover:bg-purple-400/10 px-3 py-2 rounded-full transition-all duration-300 border border-gray-700/50 hover:border-purple-400/50 group"
              onClick={() => setChainDropdownOpen(!isChainDropdownOpen)}
            >
              <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                {chain.icon}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
            </button>
            <ChainDropdown 
              isOpen={isChainDropdownOpen}
              onClose={() => setChainDropdownOpen(false)}
              onSelect={onChainSelect}
              selectedChain={chain}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative h-[calc(90vh-64px)] overflow-y-auto">
        <div className="pt-20 pb-20">
          <div className="max-w-lg mx-auto p-6 mt-20">
            <div className="bg-gray-900/70 backdrop-blur-md rounded-3xl border border-purple-500/20 p-6 shadow-lg shadow-purple-500/5 relative">
              {!showTransactionProgress ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-medium text-gray-100">Swap</h2>
                    <button className="w-10 h-10 rounded-xl bg-gray-800/70 hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-purple-400 transition-all duration-300">
                      <Settings size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <SwapField 
                      label="From"
                      token={fromToken}
                      chain={fromChain}
                      amount={fromAmount}
                      setAmount={setFromAmount}
                      isTokenDropdownOpen={fromTokenDropdownOpen}
                      isChainDropdownOpen={fromChainDropdownOpen}
                      setTokenDropdownOpen={setFromTokenDropdownOpen}
                      setChainDropdownOpen={setFromChainDropdownOpen}
                      onTokenSelect={setFromToken}
                      onChainSelect={setFromChain}
                    />

                    <div className="flex justify-center">
                      <button 
                        onClick={handleSwapDirection}
                        className="w-10 h-10 bg-gray-800/90 rounded-xl border border-purple-500/30 flex items-center justify-center text-purple-400 hover:text-purple-300 hover:border-purple-400/50 hover:bg-purple-400/10 transition-all duration-300"
                      >
                        <ArrowUpDown className="w-6 h-6" />
                      </button>
                    </div>

                    <SwapField 
                      label="To"
                      token={toToken}
                      chain={toChain}
                      amount={toAmount}
                      setAmount={setToAmount}
                      isTokenDropdownOpen={toTokenDropdownOpen}
                      isChainDropdownOpen={toChainDropdownOpen}
                      setTokenDropdownOpen={setToTokenDropdownOpen}
                      setChainDropdownOpen={setToChainDropdownOpen}
                      onTokenSelect={setToToken}
                      onChainSelect={setToChain}
                    />
                  </div>

                  <button 
                    className={`w-full mt-6 py-4 rounded-2xl font-medium transition-all duration-300 shadow-lg ${
                      isTransacting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-purple-400 text-gray-900 hover:bg-purple-300 shadow-purple-500/50 hover:shadow-purple-500/75'
                    }`}
                    onClick={isWalletConnected ? handleSwap : handleConnectWallet}
                    disabled={isTransacting}
                  >
                    {isTransacting ? 'Processing...' : (isWalletConnected ? 'Swap' : 'Connect Wallet')}
                  </button>

                  {transactionError && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {transactionError}
                    </div>
                  )}
                </>
              ) : (
                <TransactionProgress 
                  isOpen={showTransactionProgress}
                  currentStep={currentTransactionStep}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;