
const router = require("express").Router();

const { ledgerConfig } = require("../config/ledger-config");
const {
  queryAccount, queryTransactionState, getPublicKey, submitSignedTransaction
} = require("../services/ledger-service");
const {
  buildCreateAccountPayload
} = require("../builders/createAccountBuilder");
const {
  buildCreateAccountClientTransaction
} = require("../builders/clientTransactionBuilder");
const {
  signText, signBytes
} = require("../services/kms-service");
const {
  createCustomerRequest
} = require("../services/customer-service");
const {
  getLedgerMessageType,
  getLedgerEnum
} = require("../services/proto-service");
const {
  serializeCreateAccountClientTransaction
} = require("../services/transactionSerializer-service");
const {
  buildSignedTransactionFromClientTransaction
} = require("../services/signedTransaction-service");


router.get(
  "/accounts/:accountId",
  async (req, res) => {
    try {
      const result =
        await queryAccount(
          req.params.accountId
        );

      res
        .status(result.status)
        .json(result.body);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });
    }
  }
);

router.get("/accounts", async (req, res) => {
  try {
    const accountManager =
      await queryAccount(
        ledgerConfig.accountManagerId
      );

    const tokenManager =
      await queryAccount(
        ledgerConfig.tokenManagerId
      );

    res.json({
      accountManager:
        accountManager.body,

      tokenManager:
        tokenManager.body
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
});

router.get("/info", async (req, res) => {
  try {
    const accountManager =
      await queryAccount(
        ledgerConfig.accountManagerId
      );

    const tokenManager =
      await queryAccount(
        ledgerConfig.tokenManagerId
      );

    res.json({
      network: ledgerConfig.network,
      projectId: ledgerConfig.projectId,

      accountManagerId:
        ledgerConfig.accountManagerId,

      tokenManagerId:
        tokenManager.body.account
          .accountManagerDetails?.tokenManagerId ||
        ledgerConfig.tokenManagerId,

      issuanceLimit:
        tokenManager.body.account
          .tokenManagerDetails
          ?.issuanceLimit?.value
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
});

router.get(
  "/transactions/:digest",
  async (req, res) => {

    try {

      const result =
        await queryTransactionState(
          req.params.digest
        );

      res
        .status(result.status)
        .json(result.body);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }
  }
);

router.get(
  "/public-key",
  async (req, res) => {

    const publicKey =
      await getPublicKey();

    res.json({
      publicKey
    });
  }
);

router.get(
  "/test/create-account-payload",
  async (req, res) => {

    const publicKey =
      await getPublicKey();

    const payload =
      buildCreateAccountPayload({

        publicKey,

        comment:
          "BNPL Customer 001",

        tokenManagerId:
          ledgerConfig.tokenManagerId
      });

    res.json(payload);
  }
);

router.get(
  "/test/sign",
  async (req, res) => {

    try {

      const result =
        await signText(
          "GCUL Test"
        );

      res.json(result);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }
  }
);

router.post(
  "/test/sign-client-transaction",
  async (req, res) => {
    try {
      const {
        serializedClientTransactionBase64
      } = req.body;

      if (!serializedClientTransactionBase64) {
        return res.status(400).json({
          error:
            "serializedClientTransactionBase64 is required"
        });
      }

      const serializedClientTransactionBytes =
        Buffer.from(
          serializedClientTransactionBase64,
          "base64"
        );

      const result =
        await signBytes(
          serializedClientTransactionBytes
        );

      res.json({
        serializedClientTransactionBase64,
        digestHex: result.digestHex,
        senderSignatureBase64:
          result.signatureBase64
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

router.post(
  "/transactions/submit",
  async (req, res) => {
    try {
      const {
        serializedSignedTransaction
      } = req.body;

      if (!serializedSignedTransaction) {
        return res.status(400).json({
          error:
            "serializedSignedTransaction is required"
        });
      }

      const result =
        await submitSignedTransaction(
          serializedSignedTransaction
        );

      res
        .status(result.status)
        .json(result.body);

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

router.get(
  "/test/client-transaction-payload",
  async (req, res) => {
    try {
      const publicKey = await getPublicKey();

      const createAccountPayload =
        buildCreateAccountPayload({
          publicKey,
          comment: "BNPL Customer 001",
          tokenManagerId: ledgerConfig.tokenManagerId
        });

      const clientTransactionPayload =
        buildCreateAccountClientTransaction({
          senderId: ledgerConfig.accountManagerId,
          sequenceNumber: 0,
          createAccountPayload
        });

      res.json(clientTransactionPayload);

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

router.post(
  "/customers",
  async (req, res) => {

    try {

      const {
        customerName
      } = req.body;

      if (!customerName) {
        return res.status(400).json({
          error:
            "customerName is required"
        });
      }

      const payload =
        await createCustomerRequest(
          customerName
        );

      res.json(payload);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }
  }
);

router.get("/test/proto", async (req, res) => {
  try {
    const clientTransaction =
      await getLedgerMessageType("ClientTransaction");

    const signedTransaction =
      await getLedgerMessageType("SignedTransaction");

    const createAccount =
      await getLedgerMessageType("CreateAccount");

    let keyFormat = null;

    try {
      const keyFormatEnum =
        await getLedgerEnum("KeyFormat");

      keyFormat = keyFormatEnum.values;
    } catch (enumError) {
      keyFormat = "KeyFormat enum not resolved";
    }

    res.json({
      status: "PROTO_LOADED",
      messages: {
        clientTransaction:
          clientTransaction.fullName,
        signedTransaction:
          signedTransaction.fullName,
        createAccount:
          createAccount.fullName
      },
      enums: {
        keyFormat
      }
    });

  } catch (error) {
    res.status(500).json({
      status: "PROTO_LOAD_FAILED",
      error: error.message,
      stack: error.stack
    });
  }
});

router.post(
  "/test/serialize-client-transaction",
  async (req, res) => {
    try {
      const {
        customerName
      } = req.body;

      if (!customerName) {
        return res.status(400).json({
          error: "customerName is required"
        });
      }

      const result =
        await serializeCreateAccountClientTransaction(
          customerName
        );

      res.json(result);

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

router.post(
  "/test/build-signed-transaction",
  async (req, res) => {
    try {
      const {
        serializedClientTransactionBase64
      } = req.body;

      if (!serializedClientTransactionBase64) {
        return res.status(400).json({
          error:
            "serializedClientTransactionBase64 is required"
        });
      }

      const result =
        await buildSignedTransactionFromClientTransaction(
          serializedClientTransactionBase64
        );

      res.json(result);

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

router.post(
  "/test/create-signed-customer-transaction",
  async (req, res) => {
    try {
      const { customerName } = req.body;

      if (!customerName) {
        return res.status(400).json({
          error: "customerName is required"
        });
      }

      const clientTransactionResult =
        await serializeCreateAccountClientTransaction(customerName);

      const signedTransactionResult =
        await buildSignedTransactionFromClientTransaction(
          clientTransactionResult.serializedClientTransactionBase64
        );

      res.json({
        customerName,
        serializedClientTransactionBase64:
          clientTransactionResult.serializedClientTransactionBase64,
        serializedSignedTransactionBase64:
          signedTransactionResult.serializedSignedTransactionBase64,
        clientTransactionDigestHex:
          signedTransactionResult.clientTransactionDigestHex,
        signedTransactionByteLength:
          signedTransactionResult.byteLength
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

module.exports = router;