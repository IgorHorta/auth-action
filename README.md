# Infisical Auth Action

This GitHub Action performs authentication with Infisical—whether hosted in the cloud or self-hosted—and exports the obtained access token for use in your GitHub workflows.

## Configuration

- In order to use this, you will need to configure a [Machine Identity](https://infisical.com/docs/documentation/platform/identities/machine-identities) for your project.
- This action supports three ways to authenticate your workflows with Infisical - [AWS IAM Auth](https://infisical.com/docs/documentation/platform/identities/aws-auth), [OIDC](https://infisical.com/docs/documentation/platform/identities/oidc-auth/github) and [Universal Auth](https://infisical.com/docs/documentation/platform/identities/universal-auth).

### AWS IAM Auth

- Configure a machine identity to use the "AWS Auth" method. Set the allowed principal ARNs, account IDs, and other settings as needed for your setup. Refer to the setup guide [here](https://infisical.com/docs/documentation/platform/identities/aws-auth).
- Get the machine identity's ID.
- Set `method` to `aws-iam` and configure the `identity-id` input parameter.
- Your GitHub Action runner must have access to AWS credentials (either through IAM roles, environment variables, or other AWS credential providers).
- Ensure your runner has network access to AWS STS API endpoints.

```yaml
- uses: Infisical/auth-action@v1
  with:
    method: "aws-iam"
    identity-id: "24be0d94-b43a-41c4-812c-1e8654d9ce1e"
    domain: "https://app.infisical.com" # Update to the instance URL when using EU (https://eu.infisical.com), a dedicated instance, or a self-hosted instance
```

### OIDC Auth

- Configure a machine identity to use the "OIDC Auth" method. Set the bound audience, bound subject, and bound claims as needed for your setup. Refer to the setup guide [here](https://infisical.com/docs/documentation/platform/identities/oidc-auth/github).
- Get the machine identity's ID.
- Set `method` to `oidc` and configure the `identity-id` input parameter. Optionally, customize the JWT's aud field by setting the `oidc-audience` input parameter.
- For debugging OIDC configuration issues, you can use GitHub's [actions-oidc-debugger](https://github.com/github/actions-oidc-debugger) tool. This tool helps you inspect the JWT claims and verify they match your configuration.
- Add `id-token: write` to the permissions for your workflow:
```yaml
permissions:
  id-token: write
  contents: read
```

### Universal Auth

- Configure a machine identity to have an auth method of "Universal Auth".
- Get the machine identity's `client_id` and `client_secret` and store them as Github secrets (recommended) or environment variables.
- Set the `client-id` and `client-secret` input parameters.

## Usage

With this action, you can export the obtained access token in two ways: as a step output or as an environment variable.

### As a step output (default)

The access token is set as a step output and can be referenced by subsequent workflow steps using `steps.<step-id>.outputs.access-token`.

```yaml
- name: Authenticate with Infisical
  id: infisical-auth
  uses: Infisical/auth-action@v1
  with:
    method: "oidc"
    identity-id: "24be0d94-b43a-41c4-812c-1e8654d9ce1e"
    domain: "https://app.infisical.com"

- name: Use token
  run: echo "${{ steps.infisical-auth.outputs.access-token }}"
```

### As an environment variable

The access token is set as the `INFISICAL_TOKEN` environment variable, accessible by all subsequent workflow steps.

```yaml
- name: Authenticate with Infisical
  uses: Infisical/auth-action@v1
  with:
    method: "universal"
    client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
    client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
    domain: "https://app.infisical.com"
    export-type: "env"

- name: Use token
  run: echo "$INFISICAL_TOKEN"
```

## Inputs

### `method`

**Required**. The authentication method to use. Possible values are `universal`, `oidc`, and `aws-iam`.

### `client-id`

**Optional**. Machine Identity client ID. Required if method is `universal`.

### `client-secret`

**Optional**. Machine Identity secret key. Required if method is `universal`.

### `identity-id`

**Optional**. Machine Identity ID. Required if method is `oidc` or `aws-iam`.

### `oidc-audience`

**Optional**. Custom aud claim for the signed Github ID token. Configurable if method is `oidc`.

### `domain`

**Optional**. Infisical URL. Defaults to `https://app.infisical.com`. If you're using Infisical EU (`https://eu.infisical.com`) or a self-hosted/dedicated instance, you will need to set the appropriate value for this field.

### `export-type`

**Optional**. How to export the obtained access token. Use `output` to set it as a step output (`access-token`), or `env` to set it as an environment variable (`INFISICAL_TOKEN`). Defaults to `output`.

### `extra-headers`

**Optional**. Extra headers to add to all requests sent to Infisical. This is useful if your Infisical instance is behind a header-based firewall.

Example:

```yaml
extra-headers: |
    Example-Header: Header-Value
    X-Request-Id: 1234567890
    X-Authentication-Secret: ${{ secrets.AUTH_SECRET }}
```

## Outputs

### `access-token`

The obtained Infisical access token. Only set when `export-type` is `output`.
