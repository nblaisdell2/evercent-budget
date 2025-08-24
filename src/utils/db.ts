import type { QueryResultRow } from "pg";
import { Pool } from "pg";
import { env } from "../env";
import fs from "fs";

import path from "path";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const pemFilePath = path.join("/tmp", "rds-combined-ca-bundle.pem");

async function downloadPemIfNeeded(): Promise<void> {
  // Already downloaded
  if (fs.existsSync(pemFilePath)) {
    return;
  }

  const s3 = new S3Client({ region: env.AWS_REGION });
  const command = new GetObjectCommand({
    Bucket: env.SSL_PEM_BUCKET,
    Key: env.SSL_PEM_KEY,
  });

  const response = await s3.send(command);

  const streamToString = (stream: Readable): Promise<string> =>
    new Promise((resolve, reject) => {
      const chunks: any[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      stream.on("error", reject);
    });

  const pemContent = await streamToString(response.Body as Readable);
  fs.writeFileSync(pemFilePath, pemContent);
}

async function getConnection() {
  if (env.NODE_ENV == "development") {
    return {
      host: env.DB_HOST as string,
      database: env.DB_DATABASE as string,
      port: env.DB_PORT as unknown as number,
      user: env.DB_USER as string,
      password: env.DB_PASS as string,
    };
  } else {
    await downloadPemIfNeeded();
    return {
      host: env.DB_HOST as string,
      database: env.DB_DATABASE as string,
      port: env.DB_PORT as unknown as number,
      user: env.DB_USER as string,
      password: env.DB_PASS as string,
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: fs.readFileSync(pemFilePath).toString(),
      },
    };
  }
}

let pool: Pool;

async function getConnectionPool() {
  if (!pool) {
    const dbConn = await getConnection();
    pool = new Pool(dbConn);
  }
  return pool;
}

function getFunctionSQL(
  functionName: string,
  ...params: any[]
): { sql: string; params: any[] } {
  const paramList = [...Array(params.length).keys()]
    .map((v) => "$" + (v + 1))
    .join(", ");

  return { sql: `SELECT * FROM ${functionName}(${paramList});`, params };
}

function getProcedureSQL(
  procedureName: string,
  ...params: any[]
): { sql: string; params: any[] } {
  const paramList = [...Array(params.length).keys()]
    .map((v) => "$" + (v + 1))
    .join(", ");
  return { sql: `CALL ${procedureName}(${paramList});`, params };
}

export async function querySQL<TResult extends QueryResultRow>(sql: string) {
  const conn = await getConnectionPool();
  const result = await conn.query<TResult>(sql);
  return result;
}

export async function query<TResult extends QueryResultRow>(
  functionName: string,
  ...functionParams: any[]
) {
  const { sql, params } = getFunctionSQL(functionName, ...functionParams);
  let result;
  try {
    const conn = await getConnectionPool();
    result = await conn.query<TResult>(sql, params);
  } catch (ex) {
    console.log(ex);
  }

  return result;
}

export async function exec<TResult extends QueryResultRow>(
  procName: string,
  ...procParams: any[]
) {
  const { sql, params } = getProcedureSQL(procName, ...procParams);
  const conn = await getConnectionPool();
  const result = await conn.query<TResult>(sql, params);
  return result;
}
