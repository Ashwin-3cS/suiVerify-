// Controller to add a user to the whitelist and encrypt files using SEAL

const { SuiClient } = require('@mysten/sui/client');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const { Transaction } = require('@mysten/sui/transactions');
const { fromHex, toHex } = require('@mysten/sui/utils');
const { getAllowlistedKeyServers, SealClient } = require('@mysten/seal');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config({ path: '../.env' });

// Define custom Walrus endpoints
const PUBLISHER_ENDPOINT = process.env.PUBLISHER_ENDPOINT;
const AGGREGATOR_ENDPOINT = process.env.AGGREGATOR_ENDPOINT;
const NUM_EPOCH = 1;

// Initialize Sui client
const fullnode = process.env.FULLNODE;

// Attestation contract constants
const ATTESTATION_PACKAGE_ID = process.env.ATTESTATION_PACKAGE_ID || '0xe5bef0f39a39bf05d977665c26d731c139228ae09fadfb5b8cb956261f68baf6';
const ATTESTATION_CAP_ID = process.env.ATTESTATION_CAP_ID || '0x52618a65c9ed98aeb4415be9bf75aa1dce7e5df2c1edb8ef44d7e7c11b3d0fb1';
const ATTESTATION_REGISTRY_ID = process.env.ATTESTATION_REGISTRY_ID || '0xbd42f516c8e21d81b064d93c94b925f5ab66cfb49170fd036bcc77704205a9a7';
const CLOCK_ID = process.env.CLOCK_ID || '0x6';
const ATTESTATION_MODULE_NAME = 'attestation';

// Keypair for whitelister role (can be the same or different)
// const whitelisterPhrase = process.env.WHITELISTER_KEYPHRASE ;
// let whitelisterKeypair;
// try {`
//   whitelisterKeypair = Ed25519Keypair.deriveKeypair(whitelisterPhrase);
//   console.log('Whitelister address:', whitelisterKeypair.toSuiAddress());
// } catch (error) {
//   console.error('ERROR: Failed to derive whitelister keypair:', error.message);
//   // Continue execution, but this will fail later when whitelisterKeypair is used
// }



// Keypair for encrypter operations
const phrase = process.env.KEYPHRASE;
let keypair;
try {
  keypair = Ed25519Keypair.deriveKeypair(phrase);
} catch (error) {
  console.error('ERROR: Failed to derive keypair from phrase:', error.message);
  // Continue execution, but this will fail later when keypair is used
}


// Keypair for uploader operations
// const phrase = process.env.KEYPHRASE;
// let keypair;
// try {
//   keypair = Ed25519Keypair.deriveKeypair(phrase);
// } catch (error) {
//   console.error('ERROR: Failed to derive keypair from phrase:', error.message);
//   // Continue execution, but this will fail later when keypair is used
// }


// Add environment variable validation
if (!phrase) {
  console.error('ERROR: KEYPHRASE environment variable is not set');
}
if (!fullnode) {
  console.error('ERROR: FULLNODE environment variable is not set')
}

// Log environment variables for debugging (mask sensitive data)
console.log('Environment variables:');
console.log('- FULLNODE:', fullnode || 'Not set');
console.log('- PACKAGE_ID:', process.env.PACKAGE_ID || 'Not set');
console.log('- CAP_ID:', process.env.CAP_ID || 'Not set');
console.log('- WHITELIST_ID:', process.env.WHITELIST_ID || 'Not set');
console.log('- KEYPHRASE:', phrase ? '[Set but masked]' : 'Not set');
console.log('- ATTESTATION_PACKAGE_ID:', ATTESTATION_PACKAGE_ID);
console.log('- ATTESTATION_CAP_ID:', ATTESTATION_CAP_ID);
console.log('- ATTESTATION_REGISTRY_ID:', ATTESTATION_REGISTRY_ID);




const client = new SuiClient({
  url: fullnode,
});

// Initialize SEAL client
let sealClient;
try {
  sealClient = new SealClient({
    suiClient: client,
    serverObjectIds: getAllowlistedKeyServers('testnet'), 
    verifyKeyServers: false,
  });

  console.log('KeyServer IDs:', getAllowlistedKeyServers('testnet'));

} catch (error) {
  console.error('ERROR: Failed to initialize SEAL client:', error.message);
  // Continue execution, but this will fail later when sealClient is used
}

// Contract configuration
const packageId = process.env.PACKAGE_ID;
const whitelistCapId = process.env.CAP_ID;
const whitelistId = process.env.WHITELIST_ID;
const moduleName = 'did_whitelist_contract';

/**
 * Get the publisher URL for a given path
 * @param {string} path - The API path
 * @returns {string} - The full publisher URL
 */
function getPublisherUrl(path) {
  const cleanPath = path.replace(/^\/+/, '').replace(/^v1\//, '');
  return `${PUBLISHER_ENDPOINT}/v1/${cleanPath}`;
}

/**
 * Get the aggregator URL for a given path
 * @param {string} path - The API path
 * @returns {string} - The full aggregator URL
 */
function getAggregatorUrl(path) {
  const cleanPath = path.replace(/^\/+/, '').replace(/^v1\//, '');
  return `${AGGREGATOR_ENDPOINT}/v1/${cleanPath}`;
}

/**
 * Store encrypted blob on Walrus
 * @param {Uint8Array} encryptedData - The encrypted data to store
 * @returns {Promise<object>} - The storage information
 */
async function storeEncryptedBlob(encryptedData) {
  try {
    const url = `${PUBLISHER_ENDPOINT}/v1/blobs?epochs=${NUM_EPOCH}`;
    console.log("Publishing blob to URL:", url);
    
    // Convert Uint8Array to Buffer if needed
    const dataBuffer = Buffer.isBuffer(encryptedData) ? encryptedData : Buffer.from(encryptedData);
    
    // Make the PUT request
    const response = await axios.put(url, dataBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      maxBodyLength: Infinity, // Allow large payloads
      maxContentLength: Infinity
    });
    
    if (response.status === 200) {
      console.log("Blob published successfully");
      return { info: response.data };
    } else {
      console.error(`Error publishing blob: ${response.status}`);
      throw new Error(`Something went wrong when storing the blob! Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error storing encrypted blob:', error.message);
    throw error;
  }
}

/**
 * Display upload information
 * @param {object} storageInfo - The storage information from Walrus
 * @param {string} mediaType - The media type of the file
 * @param {string} encryptionId - The encryption ID
 * @returns {object|null} - The formatted upload information
 */
function displayUpload(storageInfo, mediaType, encryptionId) {
  const SUI_VIEW_TX_URL = `https://suiscan.xyz/testnet/tx`;
  const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/testnet/object`;
  
  let info;
  if ('alreadyCertified' in storageInfo) {
    info = {
      status: 'Already certified',
      blobId: storageInfo.alreadyCertified.blobId,
      endEpoch: storageInfo.alreadyCertified.endEpoch,
      suiRefType: 'Previous Sui Certified Event',
      suiRef: storageInfo.alreadyCertified.event.txDigest,
      suiBaseUrl: SUI_VIEW_TX_URL,
      blobUrl: getAggregatorUrl(`blobs/${storageInfo.alreadyCertified.blobId}`),
      suiUrl: `${SUI_VIEW_OBJECT_URL}/${storageInfo.alreadyCertified.event.txDigest}`,
      isImage: mediaType.startsWith('image'),
      whitelistId: whitelistId,
      encryptionId: encryptionId
    };
  } else if ('newlyCreated' in storageInfo) {
    info = {
      status: 'Newly created',
      blobId: storageInfo.newlyCreated.blobObject.blobId,
      endEpoch: storageInfo.newlyCreated.blobObject.storage.endEpoch,
      suiRefType: 'Associated Sui Object',
      suiRef: storageInfo.newlyCreated.blobObject.id,
      suiBaseUrl: SUI_VIEW_OBJECT_URL,
      blobUrl: getAggregatorUrl(`blobs/${storageInfo.newlyCreated.blobObject.blobId}`),
      suiUrl: `${SUI_VIEW_OBJECT_URL}/${storageInfo.newlyCreated.blobObject.id}`,
      isImage: mediaType.startsWith('image'),
      whitelistId: whitelistId,
      encryptionId: encryptionId
    };
  } else {
    console.error('Unhandled successful response!', storageInfo);
    return null;
  }
  
  return info;
}

/**
 * Add a user address to the whitelist and record in attestation contract
 * @param {string} userAddress - The address to add to the whitelist
 * @returns {Promise<object>} - Transaction results
 */
async function addUserToWhitelist(userAddress) {
  try {
    console.log('Adding user to whitelist:', userAddress);
    console.log('Using whitelist ID:', whitelistId);
    console.log('Using cap ID:', whitelistCapId);
    console.log('Using package ID:', packageId);
    console.log('Using module name:', moduleName);
    
    // Step 1: Add user to the whitelist
    // Create a new transaction
    const whitelistTransaction = new Transaction();
    
    // Add the move call to add the user to the whitelist
    whitelistTransaction.moveCall({
      target: `${packageId}::${moduleName}::add`,
      arguments: [
        whitelistTransaction.object(whitelistId), // Whitelist object
        whitelistTransaction.object(whitelistCapId), // Cap object
        whitelistTransaction.pure.address(userAddress), // User address to add
      ],
    });
    
    // Set gas budget
    whitelistTransaction.setGasBudget(100000000);
    
    console.log('Whitelist transaction prepared, signing and executing...');
    
    // Sign and execute the transaction
    const whitelistResult = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: whitelistTransaction,
      requestType: 'WaitForLocalExecution',
      options: {
        showObjectChanges: true,
        showEffects: true,
      },
    });
    
    console.log(`User ${userAddress} added to whitelist successfully`);
    console.log('Whitelist transaction digest:', whitelistResult.digest);
    
    // Step 2: Record the whitelist action in the attestation contract
    // Get the transaction digest as bytes
    const txDigestBytes = Buffer.from(whitelistResult.digest.replace('0x', ''), 'hex');
    
    // Get current timestamp in seconds
    const timestamp = Math.floor(Date.now() / 1000);
    
    console.log('Recording whitelist action in attestation contract');
    console.log('Using attestation package ID:', ATTESTATION_PACKAGE_ID);
    console.log('Using attestation cap ID:', ATTESTATION_CAP_ID);
    console.log('Using attestation registry ID:', ATTESTATION_REGISTRY_ID);
    console.log('Using timestamp:', timestamp);
    
    // Create a new transaction for attestation
    const attestationTransaction = new Transaction();
    
    // Add the move call to record the whitelist action
    attestationTransaction.moveCall({
      target: `${ATTESTATION_PACKAGE_ID}::${ATTESTATION_MODULE_NAME}::record_whitelisted_user`,
      arguments: [
        attestationTransaction.object(ATTESTATION_CAP_ID), // Attestation capability
        attestationTransaction.object(ATTESTATION_REGISTRY_ID), // Attestation registry
        attestationTransaction.pure.address(userAddress), // User address
        attestationTransaction.pure(txDigestBytes), // Transaction digest as bytes
        attestationTransaction.pure.u64(timestamp), // Timestamp
        attestationTransaction.object(CLOCK_ID), // Clock object
      ],
    });
    
    // Set gas budget
    attestationTransaction.setGasBudget(100000000);
    
    console.log('Attestation transaction prepared, signing and executing...');
    
    // Sign and execute the transaction using the whitelister keypair
    const attestationResult = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: attestationTransaction,
      requestType: 'WaitForLocalExecution',
      options: {
        showObjectChanges: true,
        showEffects: true,
      },
    });
    
    console.log(`User ${userAddress} recorded in attestation contract successfully`);
    console.log('Attestation transaction digest:', attestationResult.digest);
    
    // Return both results
    return {
      whitelistResult,
      attestationResult
    };
  } catch (error) {
    console.error(`Failed to add user to whitelist or record in attestation: ${error.message}`);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

/**
 * Encrypt file data using SEAL and store on Walrus
 * @param {Buffer|Uint8Array} fileData - The file data to encrypt
 * @param {string} policyObject - The whitelist ID to use as policy object
 * @returns {Promise<{encryptedBytes: Uint8Array, encryptionId: string, storageInfo: object, uploadInfo: object}>} - The encrypted data and related info
 */
async function encryptWithSeal(fileData, policyObject) {
  try {
    console.log('Encrypting file with SEAL');
    console.log('File size:', fileData.length, 'bytes');
    console.log('Policy object:', policyObject);
    
    // Convert Buffer to Uint8Array if needed
    const fileDataArray = fileData instanceof Buffer 
      ? new Uint8Array(fileData.buffer, fileData.byteOffset, fileData.byteLength)
      : fileData;
    
    // Generate a nonce for uniqueness
    const nonce = crypto.randomBytes(5);
    console.log('Generated nonce:', nonce.toString('hex'));
    
    // Create a unique ID by combining the policy object and nonce
    const policyObjectBytes = fromHex(policyObject);
    const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));
    
    console.log("Encrypting with ID:", id);
    console.log("Whitelist ID:", policyObject);
    
    // Encrypt the data using SEAL
    console.log('Calling SEAL client encrypt...');
    const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
      threshold: 2, // Number of key servers required for decryption
      packageId,
      id,
      data: fileDataArray,
    });
    
    console.log('Encryption successful, encrypted size:', encryptedBytes.length, 'bytes');
    
    // Store the encrypted blob on Walrus
    console.log('Storing encrypted blob on Walrus...');
    const storageInfo = await storeEncryptedBlob(encryptedBytes);
    console.log('Blob stored successfully:', storageInfo);
    
    // Format the upload information
    const uploadInfo = displayUpload(storageInfo.info, 'application/octet-stream', id);
    console.log('Upload info:', uploadInfo);
    
    return {
      encryptedBytes,
      encryptionId: id,
      storageInfo: storageInfo.info,
      uploadInfo
    };
  } catch (error) {
    console.error('Error during SEAL encryption or storage:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

/**
 * Record encryption details in the attestation contract
 * @param {string} userAddress - The user's address
 * @param {string} encryptionId - The encryption ID
 * @param {string} policyObjectId - The policy object ID (whitelist ID)
 * @returns {Promise<object>} - Transaction result
 */
async function recordEncryptionDetails(userAddress, encryptionId, policyObjectId) {
  try {
    console.log('Recording encryption details in attestation contract');
    console.log('User address:', userAddress);
    console.log('Encryption ID:', encryptionId);
    console.log('Policy object ID:', policyObjectId);
    
    // Get current timestamp in seconds
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create a new transaction
    const transaction = new Transaction();
    
    // Add the move call to record encryption details
    transaction.moveCall({
      target: `${ATTESTATION_PACKAGE_ID}::${ATTESTATION_MODULE_NAME}::record_encryption_details`,
      arguments: [
        transaction.object(ATTESTATION_CAP_ID), // Attestation capability
        transaction.object(ATTESTATION_REGISTRY_ID), // Attestation registry
        transaction.pure.address(userAddress), // User address
        transaction.pure(Buffer.from(encryptionId)), // Encryption ID as bytes
        transaction.pure(Buffer.from(policyObjectId)), // Policy object ID as bytes
        transaction.pure(Buffer.from(packageId)), // Package ID as bytes
        transaction.pure.u64(timestamp), // Timestamp
        transaction.object(CLOCK_ID), // Clock object
      ],
    });
    
    // Set gas budget
    transaction.setGasBudget(100000000);
    
    // We need to use a keypair that has the ENCRYPTER role
    // For now, we'll use the same keypair as the whitelister
    const result = await client.signAndExecuteTransaction({
      signer: keypair, // Should be replaced with encrypterKeypair in production
      transaction,
      requestType: 'WaitForLocalExecution',
      options: {
        showObjectChanges: true,
        showEffects: true,
      },
    });
    
    console.log('Encryption details recorded successfully');
    console.log('Transaction digest:', result.digest);
    
    return result;
  } catch (error) {
    console.error(`Failed to record encryption details: ${error.message}`);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

/**
 * Record blob upload details in the attestation contract
 * @param {string} userAddress - The user's address
 * @param {string} dataOwnerAddress - The data owner's address (can be same as user)
 * @returns {Promise<object>} - Transaction result
 */
async function recordBlobUpload(userAddress, dataOwnerAddress) {
  try {
    console.log('Recording blob upload details in attestation contract');
    console.log('User address:', userAddress);
    console.log('Data owner address:', dataOwnerAddress);
    
    // Get current timestamp in seconds
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create a new transaction
    const transaction = new Transaction();
    
    // Add the move call to record blob upload details
    transaction.moveCall({
      target: `${ATTESTATION_PACKAGE_ID}::${ATTESTATION_MODULE_NAME}::record_blob_upload`,
      arguments: [
        transaction.object(ATTESTATION_CAP_ID), // Attestation capability
        transaction.object(ATTESTATION_REGISTRY_ID), // Attestation registry
        transaction.pure.address(userAddress), // User address
        transaction.pure.address(dataOwnerAddress), // Data owner address
        transaction.pure.u64(timestamp), // Timestamp
        transaction.object(CLOCK_ID), // Clock object
      ],
    });
    
    // Set gas budget
    transaction.setGasBudget(100000000);
    
    // Sign and execute the transaction
    const result = await client.signAndExecuteTransaction({
      signer: keypair, // Using the same keypair for now
      transaction,
      requestType: 'WaitForLocalExecution',
      options: {
        showObjectChanges: true,
        showEffects: true,
      },
    });
    
    console.log('Blob upload details recorded successfully');
    console.log('Transaction digest:', result.digest);
    
    return result;
  } catch (error) {
    console.error(`Failed to record blob upload details: ${error.message}`);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

/**
 * Combined controller function to handle both adding a user to the whitelist
 * and encrypting a file using SEAL
 */
/**
 * Combined controller function to handle both adding a user to the whitelist
 * and encrypting a file using SEAL
 */
exports.encryptAndUpload = async (req, res, next) => {
  try {
    console.log('Request received at encryptAndUpload endpoint');
    console.log('Request body:', req.body);
    console.log('Files present:', req.files ? req.files.length : 0);
    
    // Log all field names for debugging
    if (req.files && req.files.length > 0) {
      console.log('File field names:', req.files.map(f => f.fieldname));
    }
    
    const { userAddress } = req.body;
    
    if (!userAddress) {
      console.log('Error: User address is required');
      return res.status(400).json({
        success: false,
        message: 'User address is required',
      });
    }
    
    // First, add the user to the whitelist and record in attestation contract
    console.log('Calling addUserToWhitelist...');
    const { whitelistResult, attestationResult } = await addUserToWhitelist(userAddress);
    
    // Get the first file from the files array
    const file = req.files && req.files.length > 0 ? req.files[0] : null;
    
    // If no file was uploaded, just return the whitelist result
    if (!file) {
      console.log('No file uploaded, returning whitelist result only');
      return res.status(200).json({
        success: true,
        message: 'User added to whitelist and recorded in attestation contract successfully',
        data: {
          whitelist: {
            transactionDigest: whitelistResult.digest,
            userAddress,
          },
          attestation: {
            whitelistTransactionDigest: attestationResult.digest,
          },
          timestamp: new Date()
        }
      });
    }
    
    // If a file was uploaded, proceed with encryption
    // Get file data and metadata
    console.log('File uploaded, proceeding with encryption');
    const fileBuffer = file.buffer;
    const fileName = file.originalname || 'unknown';
    const fileType = file.mimetype || 'application/octet-stream';
    console.log('File name:', fileName);
    console.log('File type:', fileType);
    console.log('File size:', fileBuffer.length, 'bytes');
    
    // Encrypt the file using SEAL with the whitelist ID as the policy object
    // and store it on Walrus
    console.log('Calling encryptWithSeal...');
    const { encryptedBytes, encryptionId, storageInfo, uploadInfo } = await encryptWithSeal(fileBuffer, whitelistId);
    
    // Record encryption details in attestation contract
    console.log('Recording encryption details in attestation contract...');
    const encryptionAttestationResult = await recordEncryptionDetails(userAddress, encryptionId, whitelistId);
    
    // Record blob upload details in attestation contract
    // For data owner, we use the same user address, but this could be different in some cases
    console.log('Recording blob upload details in attestation contract...');
    const blobUploadAttestationResult = await recordBlobUpload(userAddress, userAddress);
    
    // Return combined results
    console.log('Sending successful response');
    res.status(200).json({
      success: true,
      message: 'User added to whitelist, file encrypted and stored, and attestations recorded successfully',
      data: {
        whitelist: {
          transactionDigest: whitelistResult.digest,
          userAddress,
        },
        attestation: {
          whitelistTransactionDigest: attestationResult.digest,
          encryptionTransactionDigest: encryptionAttestationResult.digest,
          blobUploadTransactionDigest: blobUploadAttestationResult.digest,
        },
        file: {
          fileName,
          fileType,
          encryptionId,
          whitelistId,
          encryptedSize: encryptedBytes.length,
        },
        storage: uploadInfo || {
          status: 'Stored on Walrus',
          blobInfo: storageInfo
        },
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error in encryptAndUpload controller:', error.message);
    console.error('Error stack:', error.stack);
    
    // Send a more detailed error response
    res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
};
