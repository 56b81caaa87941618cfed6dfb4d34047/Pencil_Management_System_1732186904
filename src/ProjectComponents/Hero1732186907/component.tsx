
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const UniswapV3FactoryInteraction: React.FC = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const contractAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
  const chainId = 1; // Ethereum Mainnet

  const contractABI = [
    {
      name: "createPool",
      stateMutability: "nonpayable",
      inputs: [
        { name: "tokenA", type: "address" },
        { name: "tokenB", type: "address" },
        { name: "fee", type: "uint24" }
      ],
      outputs: [{ name: "pool", type: "address" }]
    },
    {
      name: "feeAmountTickSpacing",
      stateMutability: "view",
      inputs: [{ name: "", type: "uint24" }],
      outputs: [{ name: "", type: "int24" }]
    },
    {
      name: "getPool",
      stateMutability: "view",
      inputs: [
        { name: "", type: "address" },
        { name: "", type: "address" },
        { name: "", type: "uint24" }
      ],
      outputs: [{ name: "", type: "address" }]
    },
    {
      name: "parameters",
      stateMutability: "view",
      inputs: [],
      outputs: [
        { name: "factory", type: "address" },
        { name: "token0", type: "address" },
        { name: "token1", type: "address" },
        { name: "fee", type: "uint24" },
        { name: "tickSpacing", type: "int24" }
      ]
    }
  ];

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        const signer = web3Provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
      } else {
        setError('Please install MetaMask to use this dApp');
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
              params: [{ chainId: ethers.utils.hexValue(chainId) }],
            });
          } catch (switchError: any) {
            setError('Failed to switch to the correct network');
          }
        }
      } catch (error) {
        setError('Failed to connect wallet');
      }
    }
  };

  const createPool = async (tokenA: string, tokenB: string, fee: number) => {
    if (!contract) {
      await connectWallet();
    }
    if (contract) {
      try {
        const tx = await contract.createPool(tokenA, tokenB, fee);
        const receipt = await tx.wait();
        setResult(`Pool created: ${receipt.events[0].args.pool}`);
      } catch (error: any) {
        setError(`Failed to create pool: ${error.message}`);
      }
    }
  };

  const getFeeAmountTickSpacing = async (fee: number) => {
    if (!contract) {
      await connectWallet();
    }
    if (contract) {
      try {
        const tickSpacing = await contract.feeAmountTickSpacing(fee);
        setResult(`Tick spacing for fee ${fee}: ${tickSpacing}`);
      } catch (error: any) {
        setError(`Failed to get fee amount tick spacing: ${error.message}`);
      }
    }
  };

  const getPool = async (tokenA: string, tokenB: string, fee: number) => {
    if (!contract) {
      await connectWallet();
    }
    if (contract) {
      try {
        const pool = await contract.getPool(tokenA, tokenB, fee);
        setResult(`Pool address: ${pool}`);
      } catch (error: any) {
        setError(`Failed to get pool: ${error.message}`);
      }
    }
  };

  const getParameters = async () => {
    if (!contract) {
      await connectWallet();
    }
    if (contract) {
      try {
        const params = await contract.parameters();
        setResult(`Factory: ${params.factory}, Token0: ${params.token0}, Token1: ${params.token1}, Fee: ${params.fee}, Tick Spacing: ${params.tickSpacing}`);
      } catch (error: any) {
        setError(`Failed to get parameters: ${error.message}`);
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-5">
        <h1 className="text-2xl font-bold mb-5">UniswapV3Factory Interaction</h1>
        
        {error && <p className="text-red-500 mb-5">{error}</p>}
        {result && <p className="text-green-500 mb-5">{result}</p>}

        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-3">Create Pool</h2>
          <input type="text" placeholder="Token A Address" className="w-full p-2 mb-2 border rounded" id="tokenA" />
          <input type="text" placeholder="Token B Address" className="w-full p-2 mb-2 border rounded" id="tokenB" />
          <input type="number" placeholder="Fee" className="w-full p-2 mb-2 border rounded" id="fee" />
          <button 
            onClick={() => createPool(
              (document.getElementById('tokenA') as HTMLInputElement).value,
              (document.getElementById('tokenB') as HTMLInputElement).value,
              Number((document.getElementById('fee') as HTMLInputElement).value)
            )}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Pool
          </button>
        </div>

        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-3">Get Fee Amount Tick Spacing</h2>
          <input type="number" placeholder="Fee" className="w-full p-2 mb-2 border rounded" id="feeForTickSpacing" />
          <button 
            onClick={() => getFeeAmountTickSpacing(
              Number((document.getElementById('feeForTickSpacing') as HTMLInputElement).value)
            )}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Get Tick Spacing
          </button>
        </div>

        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-3">Get Pool</h2>
          <input type="text" placeholder="Token A Address" className="w-full p-2 mb-2 border rounded" id="tokenAForPool" />
          <input type="text" placeholder="Token B Address" className="w-full p-2 mb-2 border rounded" id="tokenBForPool" />
          <input type="number" placeholder="Fee" className="w-full p-2 mb-2 border rounded" id="feeForPool" />
          <button 
            onClick={() => getPool(
              (document.getElementById('tokenAForPool') as HTMLInputElement).value,
              (document.getElementById('tokenBForPool') as HTMLInputElement).value,
              Number((document.getElementById('feeForPool') as HTMLInputElement).value)
            )}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Get Pool
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Get Parameters</h2>
          <button 
            onClick={getParameters}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Get Parameters
          </button>
        </div>
      </div>
    </div>
  );
};

export { UniswapV3FactoryInteraction as component };
