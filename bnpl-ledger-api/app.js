const express =
  require("express");

const cors =
  require("cors");

const consentRoute =
  require("./routes/consent");

const passportRoute =
  require("./routes/passport");

const eligibilityRoute =
  require("./routes/eligibility");

const timelineRoute =
  require("./routes/timeline");

const dashboardRoute =
  require("./routes/dashboard");

const ledgerRoute =
  require("./routes/ledger");

const app = express();

app.use(cors());

app.use(express.json());

app.use(
  "/consent",
  consentRoute
);

app.use(
  "/passport",
  passportRoute
);

app.use(
  "/eligibility",
  eligibilityRoute
);

app.use(
  "/timeline",
  timelineRoute
);

app.use(
  "/dashboard",
  dashboardRoute

);

app.use(
  "/ledger",
  ledgerRoute
);


app.get("/", (req, res) => {

  res.json({
    service:
      "BNPL Exposure Ledger"
  });
});

const PORT = process.env.PORT || 8083;

app.listen(PORT, () => {
  console.log(
    `Backend running on port ${PORT}`
  );
});