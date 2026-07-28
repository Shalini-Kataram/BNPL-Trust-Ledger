const express =
require("express");

const cors =
require("cors");

const exposureRoute =
require("./routes/exposure");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/",(req,res)=>{

  res.json({
    service:"Mock Klarna API"
  });

});

app.use(
 "/exposure",
 exposureRoute
);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {

console.log(`Klarna running on port ${PORT}`);

});