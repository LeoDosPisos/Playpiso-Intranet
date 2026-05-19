import { useRef } from 'react'

import type { ProductDefinition } from '../types/proposalForm'
import styles from './FormRenderer.module.css'

type ProductCardProps = {
  product: ProductDefinition
  quantity: number
  disabledReason?: string
  onAdd: () => void
  onQuantityChange: (quantity: number) => void
}

type ProductCarouselProps = {
  products: readonly ProductDefinition[]
  quantities: Record<string, number>
  availabilityByProduct: Record<string, Set<string>>
  availabilityStatus: 'loading' | 'ready' | 'error'
  onAdd: (productId: string) => void
  onQuantityChange: (productId: string, quantity: number) => void
}

function ProductCard({ product, quantity, disabledReason, onAdd, onQuantityChange }: ProductCardProps) {
  const minQuantity = product.selection?.minQuantity ?? 0
  const maxQuantity = product.selection?.maxQuantity ?? 99
  const step = product.selection?.step ?? 1
  const isDisabled = Boolean(disabledReason)

  function clampQuantity(nextQuantity: number) {
    return Math.min(maxQuantity, Math.max(minQuantity, nextQuantity))
  }

  return (
    <article className={`${styles.productCard} ${isDisabled ? styles.unavailableProductCard : ''}`}>
      {product.imageSrc ? (
        <img alt="" className={styles.productImage} src={product.imageSrc} />
      ) : (
        <div className={styles.productImagePlaceholder} aria-hidden="true">
          {product.label.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className={styles.productCardBody}>
        <h3>{product.label}</h3>
        <p>{product.shortDescription ?? product.description}</p>
        {disabledReason && (
          <small className={styles.productAvailabilityMessage} data-testid={`product-unavailable-${product.id}`}>
            {disabledReason}
          </small>
        )}
      </div>

      <div className={styles.productCardFooter}>
        <div className={styles.stepper} aria-label={`Quantidade de ${product.label}`}>
          <button disabled={isDisabled} onClick={() => onQuantityChange(clampQuantity(quantity - step))} type="button">
            -
          </button>
          <input
            aria-label="Quantidade"
            data-testid={`product-quantity-${product.id}`}
            disabled={isDisabled}
            max={maxQuantity}
            min={minQuantity}
            onChange={(event) => onQuantityChange(clampQuantity(Number(event.target.value)))}
            type="number"
            value={quantity}
          />
          <button disabled={isDisabled} onClick={() => onQuantityChange(clampQuantity(quantity + step))} type="button">
            +
          </button>
        </div>
        <button data-testid={`product-add-${product.id}`} disabled={isDisabled || quantity <= 0} onClick={onAdd} type="button">
          Adicionar
        </button>
      </div>
    </article>
  )
}

function getDisabledReason(
  product: ProductDefinition,
  availabilityByProduct: Record<string, Set<string>>,
  availabilityStatus: ProductCarouselProps['availabilityStatus'],
) {
  if (availabilityStatus === 'loading') {
    return 'Verificando disponibilidade'
  }

  if (availabilityStatus === 'error') {
    return 'Disponibilidade não confirmada'
  }

  const availableVariants = availabilityByProduct[product.id]
  if (!availableVariants || availableVariants.size === 0) {
    return 'Geração PPTX indisponível'
  }

  return undefined
}

function ProductCarousel({
  products,
  quantities,
  availabilityByProduct,
  availabilityStatus,
  onAdd,
  onQuantityChange,
}: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  function scrollProducts(direction: 'previous' | 'next') {
    const track = trackRef.current

    if (!track) {
      return
    }

    const card = track.querySelector<HTMLElement>(`.${styles.productSlide}`)
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0
    const distance = card ? card.offsetWidth + gap : track.clientWidth / 3

    track.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth',
    })
  }

  return (
    <div className={styles.productCarousel}>
      <div className={styles.carouselControls} aria-label="Navegação de produtos">
        <button
          aria-label="Produto anterior"
          className={styles.carouselButton}
          onClick={() => scrollProducts('previous')}
          type="button"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          aria-label="Próximo produto"
          className={styles.carouselButton}
          onClick={() => scrollProducts('next')}
          type="button"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className={styles.productTrack} ref={trackRef} tabIndex={0}>
        {products.map((product) => (
          <div className={styles.productSlide} key={product.id}>
            <ProductCard
              disabledReason={getDisabledReason(product, availabilityByProduct, availabilityStatus)}
              onAdd={() => onAdd(product.id)}
              onQuantityChange={(quantity) => onQuantityChange(product.id, quantity)}
              product={product}
              quantity={quantities[product.id] ?? 0}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export { ProductCarousel }
