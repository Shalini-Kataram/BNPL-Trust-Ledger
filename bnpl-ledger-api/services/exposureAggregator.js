const axios = require("axios");
const providers = require("./providerRegistry");

async function getExposurePassport(
 customerHash
){

 const responses =
 await Promise.all(

   providers.map(
     async provider => {

       try {
         const response =
         await axios.get(
           `${provider.url}/exposure/${customerHash}`
         );

         return {
           provider: provider.provider,
           ...response.data
         };

       } catch (error) {
         
         console.warn(`Failed to fetch data from ${provider.provider}:`, error.message);
         
         // Return error object instead of throwing
         return {
           provider: provider.provider,
           error: true,
           errorMessage: error.message,
           exposure: 0,
           monthlyCommitment: 0,
           activePlans: [],
           missedInstallments: 0,
           defaults: 0,
           partialRepayments: 0
         };
       }
     }
   )
 );

 return responses;
}

module.exports = {
 getExposurePassport
};