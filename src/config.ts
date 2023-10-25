import dotenv from "dotenv";
import * as Joi from "joi";

dotenv.config({ path: "../.env" });

const envVarsSchema = Joi.object({
  INFURA_API_KEY: Joi.string().required(),
  PRIVATE_KEY: Joi.string().required(),
  DEPLOYED_CONTRACT_ADDRESS: Joi.string().required(),
  NETWORK: Joi.string().required(),
  START_BLOCK: Joi.number().integer().required(),
})
.unknown()
.required();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  infuraApiKey: envVars.INFURA_API_KEY,
  privateKey: envVars.PRIVATE_KEY,
  deployedContractAddress: envVars.DEPLOYED_CONTRACT_ADDRESS,
  network: envVars.NETWORK,
  startBlock: envVars.START_BLOCK,
};
