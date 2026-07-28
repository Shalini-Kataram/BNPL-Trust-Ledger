const profiles = {

  "1": {
    monthlyIncome: 3200,
    internalExposure: 450,
    internalRiskScore: 78
  },

  CUS123: {
    monthlyIncome: 3800,
    internalExposure: 600,
    internalRiskScore: 74
  },

  CUS456: {
    monthlyIncome: 3000,
    internalExposure: 900,
    internalRiskScore: 52
  }
};

function getLloydsBankingProfile(accountId) {

  const profile = profiles[accountId];

  if (profile) {
    return profile;
  }

  return {
    monthlyIncome: 3000,
    internalExposure: 500,
    internalRiskScore: 70
  };
}

module.exports = {
  getLloydsBankingProfile
};