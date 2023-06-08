# Updater/action-github-app-authenticate

A GitHub Actions custom JavaScript action that authenticates a GitHub App and generates an installation token to use in authenticated GitHub API requests.

## Inputs

### `app-id`

**Required** The ID of the GitHub App (not the installation ID).

### `private-key`

**Required** PEM encoded RSA private key for the GitHub App.

### `installation-id`

Installation ID for the specified GitHub App.
If not provided, this action will attempt to look up the installation ID using the organization value.

### `list-installs`

(Boolean) If set to true, the action will output the GitHub organizations the app is installed on instead of authenticating as one of the installs.
Defaults to `false`.

### `org`

The organization to authenticate for.
If not provided, this action will use the owner of the repo that used this action.

## Outputs

### `installation-id`
The GitHub App Installation ID used to generate token.

### `installed-orgs`
A strigified JSON array containing the GitHub organizations the app is installed on. (Only set when `list-installs` input is set to true.)

### `token`

The GitHub App installation token that may be used for authenticated requests to the GitHub API.

## Example usage

```yaml
uses: Updater/action-github-app-authenticate@main
with:
  app-id: ${{ secrets.app-id }}
  private-key: ${{ secrets.private-key }}
```
