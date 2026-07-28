module.exports = {

  CUS123: {

    provider: "Klarna",

    customerHash: "CUS123",

    activePlans: [

      {
        planId: "KL001",
        product: "MacBook Air",
        amount: 500,
        monthlyPayment: 120,
        status: "ACTIVE"
      }

    ],

    ledgerEvents: [

      {
        eventType: "NEW_PURCHASE",
        amount: 500,
        merchant: "Apple Store",
        date: "2025-10-10"
      },

      {
        eventType: "ON_TIME_PAYMENT",
        amount: 120,
        date: "2025-11-10"
      },

      {
        eventType: "ON_TIME_PAYMENT",
        amount: 120,
        date: "2025-12-10"
      }

    ]
  },

  CUS456: {

    provider: "Klarna",

    customerHash: "CUS456",

    activePlans: [

      {
        planId: "KL002",
        product: "Samsung TV",
        amount: 900,
        monthlyPayment: 180,
        status: "ACTIVE"
      }

    ],

    ledgerEvents: [

      {
        eventType: "NEW_PURCHASE",
        amount: 900
      },

      {
        eventType: "MISSED_INSTALLMENT",
        amount: 180
      }

    ]
  },
  CUS100: {
    provider: "Klarna",
    customerHash: "CUS100",

    activePlans: [
      {
        planId: "KL100",
        product: "Headphones",
        amount: 200,
        monthlyPayment: 50,
        status: "ACTIVE"
      }
    ],

    ledgerEvents: [
      {
        eventType: "NEW_PURCHASE",
        amount: 200
      },
      {
        eventType: "ON_TIME_PAYMENT",
        amount: 50
      },
      {
        eventType: "ON_TIME_PAYMENT",
        amount: 50
      }
    ]
  },
  CUS200: {
    provider: "Klarna",

    activePlans: [
      {
        amount: 500,
        monthlyPayment: 120,
        status: "ACTIVE"
      }
    ],

    ledgerEvents: [
      {
        eventType: "NEW_PURCHASE",
        amount: 500
      },
      {
        eventType: "ON_TIME_PAYMENT",
        amount: 120
      }
    ]
  },
  CUS300: {

    provider: "Klarna",

    activePlans: [
      {
        amount: 1000,
        monthlyPayment: 200,
        status: "ACTIVE"
      }
    ],

    ledgerEvents: [
      {
        eventType: "NEW_PURCHASE",
        amount: 1000
      },
      {
        eventType: "MISSED_INSTALLMENT",
        amount: 200
      }
    ]
  }

};