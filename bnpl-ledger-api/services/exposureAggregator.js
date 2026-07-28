const axios = require("axios");
const providers = require("./providerRegistry");

async function getExposurePassport(
 customerHash
){

 const responses =
 await Promise.all(

   providers.map(
     async provider => {

       const response =
       await axios.get(
         `${provider.url}/exposure/${customerHash}`
       );

       return response.data;
     }
   )
 );

 return responses;
}

module.exports = {
 getExposurePassport
};