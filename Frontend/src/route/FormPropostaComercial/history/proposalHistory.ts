import type { ProposalBuilderPayload } from '../types/proposalForm'

type ProposalHistoryEntry = {
  id: string
  savedAt: string
  filename: string
  clientName: string
  productLabels: string[]
  payload: ProposalBuilderPayload
}

const MAX_ENTRIES = 50

function storageKey(email: string) {
  return `playpiso_proposal_history_${email}`
}

function loadHistory(email: string): ProposalHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(email)) ?? '[]') as ProposalHistoryEntry[]
  } catch {
    return []
  }
}

function saveProposalEntry(email: string, entry: ProposalHistoryEntry): void {
  const next = [entry, ...loadHistory(email)].slice(0, MAX_ENTRIES)
  localStorage.setItem(storageKey(email), JSON.stringify(next))
}

function deleteProposalEntry(email: string, id: string): void {
  const next = loadHistory(email).filter((e) => e.id !== id)
  localStorage.setItem(storageKey(email), JSON.stringify(next))
}

export type { ProposalHistoryEntry }
export { loadHistory, saveProposalEntry, deleteProposalEntry }
