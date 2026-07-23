const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so your frontend (e.g., localhost:3000) can access this API
app.use(cors());
app.use(express.json());

// --- Mock Ledger Data ---
const mockLedgerData = {
  user_id: "usr_uk_8942110",
  currency: "GBP",
  timestamp: new Date().toISOString(),
  ledger_summary: {
    total_credit_limit: 1500.00,
    total_active_balance: 485.50,
    total_available_credit: 1014.50,
    overall_utilization_percentage: 32.37,
    active_plan_count: 3,
    missed_payments_last_30_days: 0,
    credit_health_status: "MODERATE_RISK"
  },
  bnpl_providers: [
    {
      provider_id: "klarna_uk",
      provider_name: "Klarna",
      credit_limit: 600.00,
      active_balance: 210.00,
      available_credit: 390.00,
      status: "ACTIVE",
      active_plans: [
        {
          plan_id: "plan_kl_9012",
          merchant: "ASOS",
          total_amount: 150.00,
          remaining_balance: 100.00,
          installments_remaining: 2,
          next_payment_amount: 50.00,
          next_payment_due: "2026-07-30"
        },
        {
          plan_id: "plan_kl_9015",
          merchant: "Nike UK",
          total_amount: 165.00,
          remaining_balance: 110.00,
          installments_remaining: 2,
          next_payment_amount: 55.00,
          next_payment_due: "2026-08-05"
        }
      ]
    },
    {
      provider_id: "clearpay_uk",
      provider_name: "Clearpay",
      credit_limit: 400.00,
      active_balance: 125.50,
      available_credit: 274.50,
      status: "ACTIVE",
      active_plans: [
        {
          plan_id: "plan_cp_4411",
          merchant: "Zara",
          total_amount: 251.00,
          remaining_balance: 125.50,
          installments_remaining: 2,
          next_payment_amount: 62.75,
          next_payment_due: "2026-07-28"
        }
      ]
    },
    {
      provider_id: "zilch_uk",
      provider_name: "Zilch",
      credit_limit: 500.00,
      active_balance: 150.00,
      available_credit: 350.00,
      status: "ACTIVE",
      active_plans: [
        {
          plan_id: "plan_zc_1102",
          merchant: "Amazon UK",
          total_amount: 200.00,
          remaining_balance: 150.00,
          installments_remaining: 3,
          next_payment_amount: 50.00,
          next_payment_due: "2026-08-01"
        }
      ]
    }
  ],
  upcoming_repayments_next_14_days: [
    { provider_name: "Clearpay", amount: 62.75, due_date: "2026-07-28" },
    { provider_name: "Klarna", amount: 50.00, due_date: "2026-07-30" },
    { provider_name: "Zilch", amount: 50.00, due_date: "2026-08-01" }
  ]
};

// ==========================================
// API 1: Fetch BNPL Ledger Summary Dashboard Data
// GET http://localhost:5000/api/v1/ledger/summary
// ==========================================
app.get('/api/v1/ledger/summary', (req, res) => {
  res.status(200).json({
    success: true,
    data: mockLedgerData
  });
});


app.listen(PORT, () => {
  console.log(`BNPL Trust Ledger Backend running on http://localhost:${PORT}`);
});