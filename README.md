# Updater/action-github-app-authenticate

A GitHub Actions custom JavaScript action that authenticates a GitHub App and generates an installation token to use in authenticated GitHub API requests.

## Inputs

### `app-id`

**Required** The ID of the GitHub App (not the installation ID)

### `private-key`

**Required** PEM encoded RSA private key for the GitHub App

### `installation-id`

Installation ID for the specified GitHub App.
If not provided, this action will attempt to look up the installation ID using the repository where this action is used.

## Outputs

### `installation-id`
The GitHub App Installation ID used to generate token.

### `token`

The GitHub App installation token that may be used for authenticated requests to the GitHub API.

## Example usage

```yaml
uses: Updater/action-github-app-authenticate@main
with:
  app-id: ${{ secrets.app-id }}
  private-key: ${{ secrets.private-key }}
```
