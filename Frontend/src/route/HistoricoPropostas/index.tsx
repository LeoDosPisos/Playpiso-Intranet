import { useState } from 'react'
import { useMsal } from '@azure/msal-react'

import Header from '@/components/Header/Header'
import UserMenu from '@/components/Header/UserMenu'
import { generateProposal } from '@/route/FormPropostaComercial/generation/buildPresentation'
import {
  deleteProposalEntry,
  loadHistory,
  type ProposalHistoryEntry,
} from '@/route/FormPropostaComercial/history/proposalHistory'

import styles from './HistoricoPropostas.module.css'

const NAV_ITEMS = [
  { label: 'Nova proposta', href: '/form-proposta-comercial' },
  { label: 'Histórico', href: '/historico' },
]

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function HistoricoPropostas() {
  const { accounts } = useMsal()
  const userEmail = accounts[0]?.username ?? 'anonymous'

  const [entries, setEntries] = useState<ProposalHistoryEntry[]>(() => loadHistory(userEmail))
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})

  function handleDelete(id: string) {
    deleteProposalEntry(userEmail, id)
    setEntries((current) => current.filter((e) => e.id !== id))
    setRowErrors((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  async function handleRegenerate(entry: ProposalHistoryEntry) {
    setRegeneratingId(entry.id)
    setRowErrors((current) => {
      const next = { ...current }
      delete next[entry.id]
      return next
    })

    try {
      const { url, filename } = await generateProposal(entry.payload)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setRowErrors((current) => ({
        ...current,
        [entry.id]: err instanceof Error ? err.message : 'Erro ao re-gerar proposta.',
      }))
    } finally {
      setRegeneratingId(null)
    }
  }

  return (
    <>
      <Header actions={<UserMenu />} navItems={NAV_ITEMS} />
      <main>
        <div className={styles.page}>
          <div className={styles.pageTitle}>
            <h1>Histórico de propostas</h1>
            <p>Propostas geradas neste dispositivo. Re-gere e baixe qualquer versão anterior.</p>
          </div>

          {entries.length === 0 ? (
            <div className={styles.emptyState}>
              <strong>Nenhuma proposta gerada ainda.</strong>
              <p>As propostas geradas neste dispositivo aparecerão aqui.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Produtos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className={styles.dateCell}>{formatDate(entry.savedAt)}</td>
                    <td className={styles.clientCell}>{entry.clientName || '—'}</td>
                    <td className={styles.productsCell}>
                      {entry.productLabels.map((label) => (
                        <span className={styles.productTag} key={label}>
                          {label}
                        </span>
                      ))}
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.regenButton}
                        disabled={regeneratingId === entry.id}
                        onClick={() => void handleRegenerate(entry)}
                        type="button"
                      >
                        {regeneratingId === entry.id ? 'Gerando...' : 'Re-gerar'}
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(entry.id)}
                        type="button"
                      >
                        Remover
                      </button>
                      {rowErrors[entry.id] && (
                        <div className={styles.rowError}>{rowErrors[entry.id]}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  )
}

export default HistoricoPropostas
