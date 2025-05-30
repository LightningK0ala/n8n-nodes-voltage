import { ICredentialType, INodeProperties } from "n8n-workflow";

export class VoltageApi implements ICredentialType {
  name = "voltageApi";
  displayName = "Voltage API";
  documentationUrl = "https://voltageapi.com/docs";
  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
      required: true,
      description: "Your Voltage API key (starts with vltg_)",
    },
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "string",
      default: "https://voltageapi.com/api/v1",
      description: "The base URL for the Voltage API",
    },
    {
      displayName: "Timeout",
      name: "timeout",
      type: "number",
      default: 30000,
      description: "Request timeout in milliseconds",
    },
  ];
}
