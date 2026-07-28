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
   service:"Mock Zilch API"
 });

});

app.use(
 "/exposure",
 exposureRoute
);

const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {

console.log(`Zilch running on port ${PORT}`);

});