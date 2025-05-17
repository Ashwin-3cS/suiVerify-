const { SuiClient, getFullnodeUrl } = require('@mysten/sui/client');

/**
 * Create a DID by submitting a transaction to the Sui network
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createDID = async (req, res) => {
  try {
    const { txBytes, signature } = req.body;

    // Validate request body
    if (!txBytes || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: txBytes and signature are required'
      });
    }

    // Initialize Sui client
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });

    // Submit transaction to Sui
    const suiResponse = await client.executeTransactionBlock({
      transactionBlock: txBytes, // base64-encoded string
      signature: signature,      // base64-encoded string
    });

    // Return the Sui response
    res.status(200).json({
      success: true,
      message: 'DID created successfully',
      suiResponse, // this contains the full response from Sui
    });
  } catch (error) {
    console.error('Error creating DID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create DID',
      error: error.message
    });
  }
};
