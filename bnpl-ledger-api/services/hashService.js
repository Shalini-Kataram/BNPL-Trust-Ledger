const crypto = require("crypto");

function generateCustomerHash(
  pan,
  mobile
) {
  return crypto
    .createHash("sha256")
    .update(`${pan}${mobile}`)
    .digest("hex");
}

module.exports = {
  generateCustomerHash
};