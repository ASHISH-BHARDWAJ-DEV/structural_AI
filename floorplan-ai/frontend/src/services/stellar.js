import { 
  getPublicKey, 
  signTransaction, 
  isConnected 
} from "@stellar/freighter-api";
import { 
  Contract, 
  Networks, 
  rpc, 
  TransactionBuilder, 
  xdr,
  nativeToScVal,
  scValToNative
} from "@stellar/stellar-sdk";

const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org:443";
const NETWORK_PASSPHRASE = import.meta.env.VITE_STELLAR_NETWORK === "TESTNET" 
  ? Networks.TESTNET 
  : Networks.PUBLIC;
const CONTRACT_ID = import.meta.env.VITE_SOROBAN_CONTRACT_ID;

const server = new rpc.Server(SOROBAN_RPC_URL);

/**
 * Connects to the Freighter wallet and returns the user's public key.
 * @returns {Promise<string>} - The user's public key.
 */
export const connectFreighter = async () => {
  if (!(await isConnected())) {
    throw new Error("Freighter wallet extension not found");
  }
  const publicKey = await getPublicKey();
  if (!publicKey) {
    throw new Error("User denied access to Freighter wallet.");
  }
  return publicKey;
};

/**
 * Helper to convert a hex string to a Uint8Array.
 */
const hexToUint8Array = (hexString) => {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return bytes;
};

/**
 * Anchors a report hash on the Stellar blockchain via a Soroban contract call.
 * @param {string} projectId - Unique ID of the project.
 * @param {string} hexHash - The SHA-256 hash in hex format.
 * @param {number} costMid - The cost associated with the report.
 * @param {string} publicKey - The user's public key from Freighter.
 */
export const anchorHashOnChain = async (projectId, hexHash, costMid, publicKey) => {
  if (!CONTRACT_ID) {
    throw new Error("Contract ID not configured (VITE_SOROBAN_CONTRACT_ID)");
  }

  const contract = new Contract(CONTRACT_ID);
  const hashBytes = hexToUint8Array(hexHash);

  // 1. Fetch source account to build transaction
  const sourceAccount = await server.getAccount(publicKey);

  // 2. Build the initial transaction for simulation
  let tx = new TransactionBuilder(sourceAccount, {
    fee: "1000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "anchor_report",
        nativeToScVal(projectId),
        nativeToScVal(hashBytes),
        nativeToScVal(BigInt(costMid))
      )
    )
    .setTimeout(30)
    .build();

  // 3. Simulate to calculate resource usage (Soroban requirement)
  const simulation = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation failed: ${simulation.error}`);
  }

  // 4. Update transaction with simulation results
  tx = rpc.assembleTransaction(tx, simulation).build();

  // 5. Sign with Freighter
  const signedXdr = await signTransaction(tx.toXDR(), {
    network: "TESTNET",
  });

  // 6. Submit signed transaction
  const result = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE));
  
  if (result.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(result.errorResultXdr)}`);
  }

  return result.hash;
};

/**
 * Queries the contract's verify_report function to return the stored data.
 * @param {string} projectId - Unique ID of the project.
 * @returns {Promise<Object|null>} - The stored report record or null.
 */
export const checkHashOnChain = async (projectId) => {
  if (!CONTRACT_ID) {
    throw new Error("Contract ID not configured");
  }

  const contract = new Contract(CONTRACT_ID);

  // Simulate call for read-only view function
  // We use a dummy builder for simulation
  const tx = new TransactionBuilder(
    await server.getLatestLedger().then(l => new rpc.Account("GCBBP563S6NIDYDKN2QVQH3G2T755RNYD2UCR55F37QZ66G6CCW3T56Z", "0")), // Placeholder
    {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    }
  )
    .addOperation(contract.call("verify_report", nativeToScVal(projectId)))
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(tx);
  
  if (rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
    const scValResult = simulation.result.retval;
    return scValToNative(scValResult);
  }

  return null;
};
