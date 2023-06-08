import {
  getBooleanInput,
  getInput,
  info,
  setFailed,
  setOutput,
  setSecret,
} from '@actions/core'
import {
  context,
  getOctokit,
} from '@actions/github'
import {
  createAppAuth
} from '@octokit/auth-app'

import type { GitHub } from '@actions/github/lib/utils'

const TOKEN_OUTPUT_NAME = 'token'

async function getOrgInstallationId(octokit: InstanceType<typeof GitHub>, org: string) {
  try {
    const {data: { id: installationId }} =
      await octokit.rest.apps.getOrgInstallation({org})

    return installationId
  } catch(err: unknown) {
    throw new Error('Failed to get installation ID! Is the GitHub App installed on this repository?', { cause: err })
  }
}

async function createInstallationToken(octokit: InstanceType<typeof GitHub>, installation_id: number) {
  try {
    const { data: installation } =
      await octokit.rest.apps.createInstallationAccessToken({ installation_id })

    return installation.token
  } catch (err: unknown) {
    throw new Error("Unable to create installation access token!", { cause: err })
  }
}

async function listInstalls(octokit: InstanceType<typeof GitHub>) {
  try {
    const { data: installations } =
      await octokit.rest.apps.listInstallations()

    const installedOrgs = installations.map(installation => installation?.account?.login)

    setOutput('installed-orgs', `["${installedOrgs.join('","')}"]`)

  } catch (err: unknown) {
    throw new Error('Failed to get installed orgs! Is the GitHub App installed anywhere?', { cause: err })
  }
}

async function generateToken(octokit: InstanceType<typeof GitHub>) {
  const org = getInput('org') || context.repo.owner

  const installationIdInput = getInput('installation-id')
  let installationId = installationIdInput === '' ? undefined : Number(installationIdInput)


  if (installationId === undefined) {
    info('No installation ID provided, attempting to fetch for repository...')
    installationId = await getOrgInstallationId(octokit, org)
    info(`Fetched installation ID ${installationId} for repository ${context.repo.owner}/${context.repo.repo}`)
  }

  info(`Generating installation token for installation ID ${installationId}`)
  const installationToken = await createInstallationToken(octokit, installationId)

  setOutput('installation-id', installationId)

  setSecret(TOKEN_OUTPUT_NAME)
  setOutput(TOKEN_OUTPUT_NAME, installationToken)

  info('Installation token generated.')
}

async function run() {
  try {
    const appId = getInput('app-id', { required: true });
    const privateKey = getInput('private-key', { required: true });

    const auth = createAppAuth({
      appId,
      privateKey,
    })

    const appAuthentication = await auth({ type: "app" })
    const octokit = getOctokit(appAuthentication.token)

    if (getBooleanInput('list-installs')) {
      listInstalls(octokit)
    } else {
      generateToken(octokit)
    }
  } catch (err: unknown) {
    setFailed(`Action failed with error ${err}`)
  }
}

run()
