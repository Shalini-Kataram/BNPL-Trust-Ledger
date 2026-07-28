module.exports = {

  CUS123: {

    provider: "Zilch",

    customerHash: "CUS123",

    activePlans: [

      {
        planId: "ZL001",
        product: "Nike Shoes",
        amount: 200,
        monthlyPayment: 50,
        status: "ACTIVE"
      }

    ],

    ledgerEvents: [

      {
        eventType: "NEW_PURCHASE",
        amount: 200,
        merchant: "Nike",
        date: "2025-08-15"
      },

      {
        eventType: "PARTIAL_REPAYMENT",
        amount: 50,
        date: "2025-09-15"
      },

      {
        eventType: "ON_TIME_PAYMENT",
        amount: 50,
        date: "2025-10-15"
      }

    ]
  },

  CUS456: {

    provider: "Zilch",

    customerHash: "CUS456",

    activePlans: [],

    ledgerEvents: [

      {
        eventType: "NEW_PURCHASE",
        amount: 400
      },

      {
        eventType: "ON_TIME_PAYMENT",
        amount: 100
      },

      {
        eventType: "ON_TIME_PAYMENT",
        amount: 100
      },

      {
        eventType: "ON_TIME_PAYMENT",
        amount: 100
      },

      {
        eventType: "PLAN_CLOSED",
        amount: 100
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
    provider: "Zilch",

    activePlans: [
      {
        amount: 300,
        monthlyPayment: 75,
        status: "ACTIVE"
      }
    ],

    ledgerEvents: [
      {
        eventType: "PARTIAL_REPAYMENT",
        amount: 75
      }
    ]
  },
  CUS300: {

    provider: "Zilch",

    activePlans: [
      {
        amount: 600,
        monthlyPayment: 100,
        status: "ACTIVE"
      }
    ],

    ledgerEvents: [
      {
        eventType: "MISSED_INSTALLMENT",
        amount: 100
      },
      {
        eventType: "MISSED_INSTALLMENT",
        amount: 100
      }
    ]
  }

};