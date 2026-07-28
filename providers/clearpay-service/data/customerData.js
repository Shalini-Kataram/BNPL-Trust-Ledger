module.exports = {

  CUS123: {

    provider: "ClearPay",

    customerHash: "CUS123",

    activePlans: [

      {
        planId: "CP001",
        product: "PlayStation 5",
        amount: 300,
        monthlyPayment: 80,
        status: "ACTIVE"
      }

    ],

    ledgerEvents: [

      {
        eventType: "NEW_PURCHASE",
        amount: 300,
        merchant: "Game Store",
        date: "2025-09-15"
      },

      {
        eventType: "ON_TIME_PAYMENT",
        amount: 80,
        date: "2025-10-15"
      },

      {
        eventType: "MISSED_INSTALLMENT",
        amount: 80,
        date: "2025-11-15"
      }

    ]
  },

  CUS456: {

    provider: "ClearPay",

    customerHash: "CUS456",

    activePlans: [

      {
        planId: "CP002",
        product: "iPhone",
        amount: 1200,
        monthlyPayment: 250,
        status: "ACTIVE"
      }

    ],

    ledgerEvents: [

      {
        eventType: "NEW_PURCHASE",
        amount: 1200
      },

      {
        eventType: "MISSED_INSTALLMENT",
        amount: 250
      },

      {
        eventType: "MISSED_INSTALLMENT",
        amount: 250
      },

      {
        eventType: "DEFAULT",
        amount: 700
      }

    ]
  },
  CUS100: {
    provider: "ClearPay",

    activePlans: [
      {
        planId: "CP100",
        product: "Monitor",
        amount: 150,
        monthlyPayment: 30,
        status: "ACTIVE"
      }
    ],

    ledgerEvents: [
      {
        eventType: "NEW_PURCHASE",
        amount: 150
      },
      {
        eventType: "ON_TIME_PAYMENT",
        amount: 30
      }
    ]
  },
  CUS200: {
    provider: "ClearPay",

    activePlans: [
      {
        amount: 600,
        monthlyPayment: 150,
        status: "ACTIVE"
      }
    ],

    ledgerEvents: [
      {
        eventType: "NEW_PURCHASE",
        amount: 600
      },
      {
        eventType: "MISSED_INSTALLMENT",
        amount: 150
      }
    ]
  },
  CUS300: {

    provider: "ClearPay",

    activePlans: [
      {
        amount: 1200,
        monthlyPayment: 250,
        status: "ACTIVE"
      }
    ],

    ledgerEvents: [
      {
        eventType: "DEFAULT",
        amount: 700
      }
    ]
  }

};