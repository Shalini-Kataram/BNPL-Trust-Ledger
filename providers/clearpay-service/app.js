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
   service:"Mock ClearPay API"
 });

});

app.use(
 "/exposure",
 exposureRoute
);

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {

console.log(`ClearPay running on port ${PORT}`);

});