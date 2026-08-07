import 'server-only'

import { getContentRepoConfig } from '@/lib/content'

export function getDocsContentGithubBase() {
  const { username, repo } = getContentRepoConfig()

  return `https://github.com/${username}/${repo}`
}

export function getDocsEditUrl(contentPath: string) {
  const { username, repo, branch } = getContentRepoConfig()

  return `https://github.com/${username}/${repo}/edit/${branch}/${contentPath}`
}

export function getDocsFeedbackUrl(title: string) {
  const base = getDocsContentGithubBase()

  return `${base}/issues/new?title=${encodeURIComponent(`Feedback for "${title}"`)}&labels=feedback`
}
