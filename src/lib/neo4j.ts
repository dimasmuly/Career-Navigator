import neo4j, { type Driver, type Session } from "neo4j-driver";

let driver: Driver | null = null;

export class DatabaseUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

export function getDriver() {
  const uri = process.env.COGNODB_URI;
  const username = process.env.COGNODB_USERNAME;
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !username || !password) {
    throw new DatabaseUnavailableError("CognoDB environment variables are not configured.");
  }

  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      disableLosslessIntegers: true,
    });
  }

  return driver;
}

export function openSession(): Session {
  const database = process.env.COGNODB_DATABASE;

  return getDriver().session(database ? { database } : undefined);
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
