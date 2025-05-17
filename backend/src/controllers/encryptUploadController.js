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

dotenv.config({ path: '../.env' });

// Initialize Sui client
const phrase = process.env.KEYPHRASE;
const fullnode = process.env.FULLNODE;

// Add environment variable validation
if (!phrase) {
  console.error('ERROR: KEYPHRASE environment variable is not set');
}
if (!fullnode) {
  console.error('ERROR: FULLNODE environment variable is not set');
}

// Log environment variables for debugging (mask sensitive data)
console.log('Environment variables:');
console.log('- FULLNODE:', fullnode || 'Not set');
console.log('- PACKAGE_ID:', process.env.PACKAGE_ID || 'Not set');
console.log('- CAP_ID:', process.env.CAP_ID || 'Not set');
console.log('- WHITELIST_ID:', process.env.WHITELIST_ID || 'Not set');
console.log('- KEYPHRASE:', phrase ? '[Set but masked]' : 'Not set');

let keypair;
try {
  keypair = Ed25519Keypair.deriveKeypair(phrase);
} catch (error) {
  console.error('ERROR: Failed to derive keypair from phrase:', error.message);
  // Continue execution, but this will fail later when keypair is used
}

const client = new SuiClient({
  url: fullnode,
});

// Initialize SEAL client
let sealClient;
try {
  sealClient = new SealClient({
    client,
    serverObjectIds: getAllowlistedKeyServers('testnet'), 
    verifyKeyServers: false,

  });
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
 * Add a user address to the whitelist
 * @param {string} userAddress - The address to add to the whitelist
 * @returns {Promise<object>} - Transaction result
 */
async function addUserToWhitelist(userAddress) {
  try {
    console.log('Adding user to whitelist:', userAddress);
    console.log('Using whitelist ID:', whitelistId);
    console.log('Using cap ID:', whitelistCapId);
    console.log('Using package ID:', packageId);
    console.log('Using module name:', moduleName);
    
    // Create a new transaction
    const transaction = new Transaction();
    
    // Add the move call to add the user to the whitelist
    transaction.moveCall({
      target: `${packageId}::${moduleName}::add`,
      arguments: [
        transaction.object(whitelistId), // Whitelist object
        transaction.object(whitelistCapId), // Cap object
        transaction.pure.address(userAddress), // User address to add - fixed to use pure.address
      ],
    });
    
    // Set gas budget
    transaction.setGasBudget(5000000000);
    
    console.log('Transaction prepared, signing and executing...');
    
    // Sign and execute the transaction
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction,
      requestType: 'WaitForLocalExecution',
      options: {
        showObjectChanges: true,
        showEffects: true,
      },
    });
    
    console.log(`User ${userAddress} added to whitelist successfully`);
    console.log('Transaction digest:', result.digest);
    return result;
  } catch (error) {
    console.error(`Failed to add user to whitelist: ${error.message}`);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

/**
 * Encrypt file data using SEAL
 * @param {Buffer|Uint8Array} fileData - The file data to encrypt
 * @param {string} policyObject - The whitelist ID to use as policy object
 * @returns {Promise<{encryptedBytes: Uint8Array, encryptionId: string}>} - The encrypted data and encryption ID
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
    
    return {
      encryptedBytes,
      encryptionId: id
    };
  } catch (error) {
    console.error('Error during SEAL encryption:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

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
    
    // First, add the user to the whitelist
    console.log('Calling addUserToWhitelist...');
    const whitelistResult = await addUserToWhitelist(userAddress);
    
    // Get the first file from the files array
    const file = req.files && req.files.length > 0 ? req.files[0] : null;
    
    // If no file was uploaded, just return the whitelist result
    if (!file) {
      console.log('No file uploaded, returning whitelist result only');
      return res.status(200).json({
        success: true,
        message: 'User added to whitelist successfully',
        data: {
          transactionDigest: whitelistResult.digest,
          userAddress,
          timestamp: new Date()
        }
      });
    }
    
    // If a file was uploaded, proceed with encryption
    // Get file data and metadata
    console.log('File uploaded, proceeding with encryption');
    const fileBuffer = file.buffer;
    const fileName = file.originalname || 'unknown';
    console.log('File name:', fileName);
    console.log('File size:', fileBuffer.length, 'bytes');
    
    // Encrypt the file using SEAL with the whitelist ID as the policy object
    console.log('Calling encryptWithSeal...');
    const { encryptedBytes, encryptionId } = await encryptWithSeal(fileBuffer, whitelistId);
    
    // Return combined results
    console.log('Sending successful response');
    res.status(200).json({
      success: true,
      message: 'User added to whitelist and file encrypted successfully',
      data: {
        whitelist: {
          transactionDigest: whitelistResult.digest,
          userAddress,
        },
        file: {
          fileName,
          encryptionId,
          whitelistId,
          encryptedSize: encryptedBytes.length,
          // Convert encryptedBytes to base64 for transmission
          encryptedData: Buffer.from(encryptedBytes).toString('base64')
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