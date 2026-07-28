function calculateRisk(providers) {

  let score = 50;

  let totalExposure = 0;
  let totalActivePlans = 0;
  let totalDefaults = 0;
  let totalMissedInstallments = 0;

  providers.forEach(provider => {

    if (provider.error) {
      return;
    }

    totalExposure += provider.exposure || 0;

    totalActivePlans +=
      provider.activePlans?.length || 0;

    totalDefaults +=
      provider.defaults || 0;

    totalMissedInstallments +=
      provider.missedInstallments || 0;

    provider.ledgerEvents?.forEach(event => {

      switch (event.eventType) {

        case "ON_TIME_PAYMENT":
          score += 5;
          break;

        case "PARTIAL_REPAYMENT":
          score += 3;
          break;

        case "PLAN_CLOSED":
          score += 10;
          break;

        case "MISSED_INSTALLMENT":
          score -= 15;
          break;

        case "DEFAULT":
          score -= 40;
          break;

        default:
          break;
      }

    });

  });

  // Exposure penalty

  if (totalExposure > 3000) {
    score -= 20;
  }
  else if (totalExposure > 2000) {
    score -= 15;
  }
  else if (totalExposure > 1000) {
    score -= 10;
  }

  // Active plans penalty

  if (totalActivePlans > 6) {
    score -= 15;
  }
  else if (totalActivePlans > 4) {
    score -= 10;
  }
  else if (totalActivePlans > 2) {
    score -= 5;
  }

  // Additional risk penalties

  score -= (totalMissedInstallments * 5);

  score -= (totalDefaults * 20);

  // Clamp between 0 and 100

  score = Math.max(0, score);
  score = Math.min(100, score);

  return score;
}

module.exports = calculateRisk;