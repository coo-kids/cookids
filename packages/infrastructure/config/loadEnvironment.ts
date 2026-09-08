import dotenvFlow from "dotenv-flow";

export function loadEnvironment() {
  dotenvFlow.config({ silent: true });

  return process.env
}
