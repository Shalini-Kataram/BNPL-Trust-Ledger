export const sampleLedgerData = {
    "customerHash": "CUS123",
    "trustScore": 100,
    "trustScoreLabel": "Good",
    "riskLevel": "LOW",
    "totalExposure": 1000,
    "activePlans": 3,
    "monthlyCommitment": 250,
    "missedInstallments": 1,
    "defaults": 0,
    "providers": [
        {
            "provider": "Klarna",
            "customerHash": "CUS123",
            "exposure": 500,
            "activePlans": [
                {
                    "planId": "KL001",
                    "product": "MacBook Air",
                    "amount": 500,
                    "monthlyPayment": 120,
                    "status": "ACTIVE"
                }
            ],
            "monthlyCommitment": 120,
            "missedInstallments": 0,
            "ledgerEvents": [
                {
                    "eventType": "NEW_PURCHASE",
                    "amount": 500,
                    "merchant": "Apple Store",
                    "date": "2025-10-10"
                },
                {
                    "eventType": "ON_TIME_PAYMENT",
                    "amount": 120,
                    "date": "2025-11-10"
                },
                {
                    "eventType": "ON_TIME_PAYMENT",
                    "amount": 120,
                    "date": "2025-12-10"
                }
            ]
        },
        {
            "provider": "ClearPay",
            "customerHash": "CUS123",
            "exposure": 300,
            "monthlyCommitment": 80,
            "missedInstallments": 1,
            "defaults": 0,
            "activePlans": [
                {
                    "planId": "CP001",
                    "product": "PlayStation 5",
                    "amount": 300,
                    "monthlyPayment": 80,
                    "status": "ACTIVE"
                }
            ],
            "ledgerEvents": [
                {
                    "eventType": "NEW_PURCHASE",
                    "amount": 300,
                    "merchant": "Game Store",
                    "date": "2025-09-15"
                },
                {
                    "eventType": "ON_TIME_PAYMENT",
                    "amount": 80,
                    "date": "2025-10-15"
                },
                {
                    "eventType": "MISSED_INSTALLMENT",
                    "amount": 80,
                    "date": "2025-11-15"
                }
            ]
        },
        {
            "provider": "Zilch",
            "customerHash": "CUS123",
            "exposure": 200,
            "monthlyCommitment": 50,
            "partialRepayments": 1,
            "closedPlans": 0,
            "activePlans": [
                {
                    "planId": "ZL001",
                    "product": "Nike Shoes",
                    "amount": 200,
                    "monthlyPayment": 50,
                    "status": "ACTIVE"
                }
            ],
            "ledgerEvents": [
                {
                    "eventType": "NEW_PURCHASE",
                    "amount": 200,
                    "merchant": "Nike",
                    "date": "2025-08-15"
                },
                {
                    "eventType": "PARTIAL_REPAYMENT",
                    "amount": 50,
                    "date": "2025-09-15"
                },
                {
                    "eventType": "ON_TIME_PAYMENT",
                    "amount": 50,
                    "date": "2025-10-15"
                }
            ]
        }
    ]
}
