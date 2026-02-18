import axios from "axios";
import core from "@actions/core";
import fs from "fs/promises";
import { AxiosError } from "axios";
import { AuthMethod, ExportType } from "./constants";

export const createAxiosInstance = (
  domain: string,
  defaultHeaders?: Record<string, string>,
) => {
  const instance = axios.create({
    baseURL: domain,
    ...(defaultHeaders && { headers: defaultHeaders }),
  });

  return instance;
};

export const handleRequestError = (err: unknown) => {
  if (err instanceof AxiosError) {
    core.error(err.response?.data?.message);
    if (typeof err?.response?.data === "object") {
      core.error(JSON.stringify(err?.response?.data, null, 4));
    }
  } else {
    core.error((err as Error)?.message);
  }
};

export const validateExportType = (exportType: string) => {
  if (!exportType) {
    throw new Error("Export type is required");
  }

  if (!Object.values(ExportType).includes(exportType as ExportType)) {
    throw new Error(`Invalid export type: ${exportType}`);
  }
};

export const validateAuthMethod = (authMethod: string) => {
  if (!Object.values(AuthMethod).includes(authMethod as AuthMethod)) {
    throw new Error(`Invalid auth method: ${authMethod}`);
  }
};

export const exportAccessToken = async (
  infisicalToken: string,
  exportType: ExportType,
) => {
  core.setSecret(infisicalToken);

  if (exportType === ExportType.Env) {
    core.exportVariable("INFISICAL_TOKEN", infisicalToken);
    core.info(
      "Injected Infisical token as environment variable [INFISICAL_TOKEN]",
    );
  }

  if (exportType === ExportType.Output) {
    core.setOutput("access-token", infisicalToken);
    core.info("Set Infisical token as action output [access-token]");
  }
};
