
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const UniswapV3FactoryInterface: React.FC = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [fee, setFee] = useState('');
  const [poolAddress, setPoolAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const contractAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
  const chainId = 1; // Ethereum Mainnet

  const contractABI = [
    {
      "name": "createPool",
      "stateMutability": "nonpayable",
      "inputs": [
        { "name": "tokenA", "type": "address" },
        { "name": "tokenB", "type": "address" },
        { "name": "fee", "type": "uint24" }
      ],
      "outputs": [{ "name": "pool", "type": "address" }]
    },
    {
      "name": "getPool",
      "stateMutability": "view",
      "inputs": [
        { "name": "", "type": "address" },
        { "name": "", "type": "address" },
        { "name": "", "type": "uint24" }
      ],
      "outputs": [{ "name": "", "type": "address" }]
    }
  ];

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        const factoryContract = new ethers.Contract(contractAddress, contractABI, web3Signer);
        setContract(factoryContract);
      } else {
        setErrorMessage('Please install MetaMask to use this dApp');
      }
    };

    init();
  }, []);

  const connectWallet = async () => {
    if (provider) {
      try {
        await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();
        if (network.chainId !== chainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
          } catch (switchError: any) {
            setErrorMessage('Failed to switch to the correct network');
          }
        }
      } catch (error: any) {
        setErrorMessage('Failed to connect wallet');
      }
    }
  };

  const createPool = async () => {
    if (!contract || !signer) {
      await connectWallet();
      if (!contract || !signer) return;
    }

    try {
      const tx = await contract.createPool(tokenA, tokenB, parseInt(fee));
      const receipt = await tx.wait();
      const event = receipt.events.find((e: any) => e.event === 'PoolCreated');
      if (event) {
        setPoolAddress(event.args.pool);
        setErrorMessage('');
      }
    } catch (error: any) {
      setErrorMessage('Failed to create pool: ' + error.message);
    }
  };

  const getPool = async () => {
    if (!contract || !signer) {
      await connectWallet();
      if (!contract || !signer) return;
    }

    try {
      const pool = await contract.getPool(tokenA, tokenB, parseInt(fee));
      setPoolAddress(pool);
      setErrorMessage('');
    } catch (error: any) {
      setErrorMessage('Failed to get pool: ' + error.message);
    }
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-5">Uniswap V3 Factory Interface</h1>

      <div className="mb-5">
        <input
          type="text"
          placeholder="Token A Address"
          value={tokenA}
          onChange={(e) => setTokenA(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <input
          type="text"
          placeholder="Token B Address"
          value={tokenB}
          onChange={(e) => setTokenB(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <input
          type="text"
          placeholder="Fee"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          className="p-2 border rounded mr-2"
        />
      </div>

      <div className="mb-5">
        <button onClick={createPool} className="bg-blue-500 text-white p-2 rounded mr-2 hover:bg-blue-600">
          Create Pool
        </button>
        <button onClick={getPool} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Get Pool
        </button>
      </div>

      {poolAddress && (
        <div className="mb-5">
          <h2 className="text-xl font-semibold">Pool Address:</h2>
          <p className="break-all">{poolAddress}</p>
        </div>
      )}

      {errorMessage && (
        <div className="text-red-500 mb-5">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export { UniswapV3FactoryInterface as component };
