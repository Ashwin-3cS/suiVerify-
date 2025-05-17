// Controller to add a user to the whitelist by calling the contract function

const { SuiClient } = require('@mysten/sui/client');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const { Transaction } = require('@mysten/sui/transactions');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

// Initialize Sui client
const phrase = process.env.KEYPHRASE;
const fullnode = process.env.FULLNODE;
const keypair = Ed25519Keypair.deriveKeypair(phrase);
const client = new SuiClient({
  url: fullnode,
});


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
    return result;
  } catch (error) {
    console.error(`Failed to add user to whitelist: ${error.message}`);
    throw error;
  }
}

/**
 * Controller function to handle adding a user to the whitelist
 */
exports.encryptAndUpload = async (req, res, next) => {
  try {
    const { userAddress } = req.body;
    
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        message: 'User address is required',
      });
    }
    
    const result = await addUserToWhitelist(userAddress);
    
    res.status(200).json({
      success: true,
      message: 'User added to whitelist successfully',
      data: {
        transactionDigest: result.digest,
        userAddress,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};  