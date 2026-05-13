import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[SMDP-MOCK] ${req.method} ${req.url}`);
  next();
});

// ES9+ initiateAuthentication
app.post('/gsma/rsp2/es9plus/initiateAuthentication', (req, res) => {
  const { euiccChallenge, smdpAddress } = req.body;

  console.log(`[SMDP-MOCK] Received initiateAuthentication from ${smdpAddress}`);
  console.log(`[SMDP-MOCK] eUICC Challenge: ${euiccChallenge}`);

  // Response mockeada según SGP.22
  res.json({
    transactionId: "abc-123-transaction-id",
    serverSignedData: {
      transactionId: "abc-123-transaction-id",
      smdpAddress: "localhost",
      euiccChallenge: euiccChallenge
    },
    serverSignature1: "MOCK_SIGNATURE_DATA",
    euiccCertificate: "MOCK_EUICC_CERT"
  });
});

app.listen(port, () => {
  console.log(`🚀 SM-DP+ Mock server running at http://localhost:${port}`);
});
