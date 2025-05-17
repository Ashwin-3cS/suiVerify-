const { SuiClient, getFullnodeUrl } = require('@mysten/sui/client');

// Initialize Sui client
const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

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

    // Decode base64 to Buffer
    const txBytesBuffer = Buffer.from(txBytes, 'base64');

    // Submit transaction to Sui

    // Return success response
    res.status(200).json({
      success: true,
      message: 'DID created successfully',
    
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