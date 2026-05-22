/**
 * E2E — Geração de proposta comercial
 *
 * Pré-requisitos:
 *   - npm run dev (Vite, porta 5173) — gerenciado pelo webServer do Playwright
 *   - cd pptx-generator-service && uvicorn main:app --reload (porta 8000)
 *
 * Convenção de data-testid:
 *   product-add-{productId}      → botão "Adicionar" no carousel
 *   product-quantity-{productId} → stepper de quantidade no carousel
 *   group-tab-{groupId}          → aba de grupo no workspace
 *   btn-remove-group             → botão remover grupo ativo
 *   btn-gerar-proposta           → botão submit
 *   generation-error             → banner de erro de geração
 */

import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('__e2e_bypass_auth__', 'true')
  })
})

const DISPONIBILIDADE_PADRAO = [
  { productId: 'beach_tenis', variantIds: ['padrao'] },
  { productId: 'quadra_tenis', variantIds: ['piso_asfaltico', 'saibro'] },
]

async function mockDisponibilidade(page: import('@playwright/test').Page) {
  await page.route('**/produtos-disponiveis', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(DISPONIBILIDADE_PADRAO),
    }),
  )
}

async function preencherFormulario(page: import('@playwright/test').Page) {
  await mockDisponibilidade(page)
  await page.goto('/form-proposta-comercial')

  // Dados da proposta — número único para evitar conflito de chave duplicada
  await page.locator('#numero_proposta').fill(`E2E-${Date.now()}`)
  await page.locator('#data_solicitacao').fill('2025-01-15')
  await page.locator('#data_envio').fill('2025-01-20')

  // Dados do cliente
  await page.locator('#nome_razao_social').fill('Arena Sports Ltda')
  await page.locator('#nome_contato').fill('João Silva')
  await page.locator('#cpf_cnpj').fill('12.345.678/0001-99')
  await page.locator('#email').fill('joao@arenasports.com.br')
  await page.locator('#telefone').fill('11999990000')

  // Dados da obra
  await page.locator('#endereco_cliente').fill('Rua das Quadras, 100')
  await page.locator('#local_obra').fill('Galpão A')
  await page.locator('#cidade').fill('São Paulo')
  await page.locator('#estado').fill('SP')
  await page.locator('#tipo_projeto').selectOption({ index: 1 })

  // Adicionar produto: 1 quadra de Beach Tennis
  await page.locator('[data-testid="product-quantity-beach_tenis"]').fill('1')
  await page.locator('[data-testid="product-add-beach_tenis"]').click()

  // Preencher campos obrigatórios do grupo Beach Tennis
  await page.locator('#largura').fill('8')
  await page.locator('#comprimento').fill('16')
  await page.locator('#tipo_terreno').selectOption({ index: 1 })
  await page.locator('#dificuldade_acesso').selectOption({ index: 1 })
  await page.locator('#responsavel_material_pedreira').selectOption({ index: 1 })
  await page.locator('#tipo_areia').selectOption({ index: 1 })
  await page.locator('#espessura_areia').fill('30')
}

test('gera proposta e dispara download do .pptx', async ({ page }) => {
  test.setTimeout(90000)

  await preencherFormulario(page)

  // Verifica que campos globais críticos foram preenchidos
  await expect(page.locator('#nome_razao_social')).toHaveValue('Arena Sports Ltda')
  await expect(page.locator('#cpf_cnpj')).toHaveValue('12.345.678/0001-99')
  await expect(page.locator('#largura')).toHaveValue('8')

  await page.screenshot({ path: 'test-results/antes-submit.png' })

  await page.locator('[data-testid="btn-gerar-proposta"]').click()

  // A app exibe uma área de download com link <a download> após a geração
  await expect(page.locator('[data-testid="download-area"]')).toBeVisible({ timeout: 75000 })

  const downloadPromise = page.waitForEvent('download')
  await page.locator('[data-testid="btn-baixar-proposta"]').click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/Proposta Playpiso.*\.pptx/)
})

test('exibe banner de erro quando o backend está indisponível', async ({ page }) => {
  await page.route('**/api/proposals**', (route) => route.abort())

  await preencherFormulario(page)

  await page.locator('[data-testid="btn-gerar-proposta"]').click()

  await expect(page.locator('[data-testid="generation-error"]')).toBeVisible()
})

test('bloqueia produtos sem geração PPTX disponível', async ({ page }) => {
  await mockDisponibilidade(page)
  await page.goto('/form-proposta-comercial')

  await expect(page.locator('[data-testid="product-unavailable-campo"]')).toBeVisible()
  await expect(page.locator('[data-testid="product-quantity-campo"]')).toBeDisabled()
  await expect(page.locator('[data-testid="product-add-campo"]')).toBeDisabled()
})

test('desabilita variantes sem geração PPTX disponível', async ({ page }) => {
  await mockDisponibilidade(page)
  await page.goto('/form-proposta-comercial')

  await page.locator('[data-testid="product-quantity-quadra_tenis"]').fill('1')
  await page.locator('[data-testid="product-add-quadra_tenis"]').click()

  await expect(page.locator('#variante_quadra_tenis option[value="grama"]')).toBeDisabled()
  await expect(page.locator('#variante_quadra_tenis option[value="saibro"]')).toBeEnabled()
})

test('bloqueia geração quando disponibilidade não é confirmada', async ({ page }) => {
  await page.route('**/produtos-disponiveis', (route) => route.abort())

  await page.goto('/form-proposta-comercial')

  await expect(page.locator('[data-testid="availability-error"]')).toBeVisible()
  await expect(page.locator('[data-testid="btn-gerar-proposta"]')).toBeDisabled()
})
