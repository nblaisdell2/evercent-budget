import fs from "fs";
import path from "path";

const serverJsPath = path.resolve(".next/standalone/server.js");

// Load the existing content
let serverJs = fs.readFileSync(serverJsPath, "utf8");

// Prepare the patch code to inject at the top
const injectCode = `
// import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// const client = new SecretsManagerClient({ region: "us-east-1" });

async function loadSecrets() {
  console.log("SECRET_ID =", process.env.SECRET_ID);

  // const command = new GetSecretValueCommand({ SecretId: process.env.SECRET_ID.SECRET_ID });
  // const response = await client.send(command);
  // const secrets = JSON.parse(response.SecretString);
  const secrets = JSON.parse(process.env.SECRET_ID);
  for (const [key, value] of Object.entries(secrets)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Block the app from starting until secrets are loaded
await loadSecrets();
;
`;
// Inject the code after the first import statements
// We'll find the first line that starts with a comment or executable code
const insertPoint = serverJs.indexOf("\n");

serverJs =
  serverJs.slice(0, insertPoint) +
  "\n" +
  injectCode +
  serverJs.slice(insertPoint);

// Write the modified file back
fs.writeFileSync(serverJsPath, serverJs);

console.log("? Patched server.js with AWS Secrets Manager bootstrap code");
