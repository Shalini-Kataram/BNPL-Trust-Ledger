const fs = require("fs");
const path = require("path");
const protobuf = require("protobufjs");
const googleProtoFiles = require("google-proto-files");

let rootCache = null;

async function loadLedgerProto() {
  if (rootCache) {
    return rootCache;
  }

  const root = new protobuf.Root();

  root.resolvePath = function (origin, target) {

    // Local GCUL protos
    const localPath = path.join(
      process.cwd(),
      "proto",
      target
    );

    if (fs.existsSync(localPath)) {
      return localPath;
    }

    // Google standard protos
    const googlePath = path.join(
      process.cwd(),
      "node_modules/google-proto-files",
      target
    );

    if (fs.existsSync(googlePath)) {
      return googlePath;
    }

    console.log("UNRESOLVED PROTO:", target);

    return target;
  };

  const typesProtoPath = path.join(
    process.cwd(),
    "proto/google/cloud/universalledger/v1/types.proto"
  );

  rootCache = await root.load(typesProtoPath, {
    keepCase: true
  });

  rootCache.resolveAll();

  return rootCache;
}

async function getLedgerMessageType(typeName) {
  const root = await loadLedgerProto();

  return root.lookupType(
    `google.cloud.universalledger.v1.${typeName}`
  );
}

async function getLedgerEnum(enumName) {
  const root = await loadLedgerProto();

  return root.lookupEnum(
    `google.cloud.universalledger.v1.${enumName}`
  );
}

module.exports = {
  loadLedgerProto,
  getLedgerMessageType,
  getLedgerEnum
};