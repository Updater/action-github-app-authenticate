import {
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

async function getRepositoryInstallationId(octokit: InstanceType<typeof GitHub>, repoContext: {owner: string, repo: string}) {
  try {
    const {data: { id: installationId }} =
      await octokit.rest.apps.getRepoInstallation(repoContext)

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

async function run() {
  try {
    const appId = getInput('app-id', { required: true });
    const privateKey = getInput('private-key', { required: true });
    const installationIdInput = getInput('installation-id')

    let installationId = installationIdInput === '' ? undefined : Number(installationIdInput)

    const auth = createAppAuth({
      appId,
      privateKey,
    })

    const appAuthentication = await auth({ type: "app" })
    const octokit = getOctokit(appAuthentication.token)

    if (installationId === undefined) {
      info('No installation ID provided, attempting to fetch for repository...')
      installationId = await getRepositoryInstallationId(octokit, context.repo)
      info(`Fetched installation ID ${installationId} for repository ${context.repo.owner}/${context.repo.repo}`)
    }

    info(`Generating installation token for installation ID ${installationId}`)
    const installationToken = await createInstallationToken(octokit, installationId)

    setSecret(TOKEN_OUTPUT_NAME)
    setOutput(TOKEN_OUTPUT_NAME, installationToken)
    info('Installation token generated.')
  } catch (err: unknown) {
    setFailed(`Action failed with error ${err}`)
  }
}

run()
