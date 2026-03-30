import { 
  requestAccess, 
  getAddress,
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
  scValToNative,
  Account,
  Keypair
} from "@stellar/stellar-sdk";

const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org:443";
const CONTRACT_ID = import.meta.env.VITE_SOROBAN_CONTRACT_ID;

/** True when no contract is deployed yet — runs a local simulation instead */
export const DEMO_MODE = !CONTRACT_ID;

const server = new rpc.Server(SOROBAN_RPC_URL);

/**
 * Connects to the Freighter wallet and returns the user's public key.
 * Uses the modern requestAccess() API (replaces deprecated getPublicKey).
 * @returns {Promise<string>} - The user's public key.
 */
export const connectFreighter = async () => {
  // Check if extension is installed
  const connected = await isConnected();
  if (!connected || !connected.isConnected) {
    throw new Error("Freighter wallet extension not found");
  }

  // requestAccess() prompts the user to authorize and returns the public key
  const accessResult = await requestAccess();
  if (accessResult.error) {
    throw new Error("Transaction cancelled");
  }
  const publicKey = accessResult.address;
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
  // ── DEMO MODE: no contract deployed yet ──────────────────────────────────────
  if (DEMO_MODE) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Return a plausible fake tx hash so the whole flow can be tested
    const fakeTxHash = `DEMO_${hexHash.substring(0, 16).toUpperCase()}...${Date.now()}`;
    return fakeTxHash;
  }

  const contract = new Contract(CONTRACT_ID);

  // 1. Fetch source account to build transaction
  const sourceAccount = await server.getAccount(publicKey);

  // 2. Build the initial transaction
  let tx = new TransactionBuilder(sourceAccount, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      contract.call(
        "anchor_report",
        nativeToScVal(projectId),
        nativeToScVal(hexToUint8Array(hexHash)),
        nativeToScVal(BigInt(costMid))
      )
    )
    .setTimeout(30)
    .build();

  // 3. Prepare the transaction (simulate + assemble in one go)
  const preparedTx = await server.prepareTransaction(tx);

  // 4. Sign with Freighter (passing XDR string and explicit networkPassphrase)
  const result = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase: Networks.TESTNET,
  });

  if (result.error) {
    throw new Error(`Freighter error: ${result.error}`);
  }

  const signedXdr = result.signedTxXdr;

  // 5. Submit signed transaction
  const submissionResult = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET));
  
  if (submissionResult.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(submissionResult.errorResultXdr)}`);
  }

  return submissionResult.hash;
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
  // We use a valid random keypair for simulation to pass checksum validation
  const dummySource = Keypair.random().publicKey();
  const tx = new TransactionBuilder(
    new Account(dummySource, "0"),
    {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
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
