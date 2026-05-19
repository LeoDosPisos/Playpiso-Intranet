import type { ReactNode } from 'react'

import playpisoLogo from '@/assets/brand/Playpiso-Logo.png'

import styles from './Header.module.css'

type HeaderNavItem = {
  label: string
  href: string
}

type HeaderProps = {
  logoSrc?: string
  logoAlt?: string
  homeHref?: string
  navItems?: HeaderNavItem[]
  actions?: ReactNode
}

function Header({
  logoSrc = playpisoLogo,
  logoAlt = 'Playpiso',
  homeHref = '/',
  navItems = [],
  actions,
}: HeaderProps) {
  const hasNavigation = navItems.length > 0

  return (
    <header className={styles.header}>
      <a className={styles.brand} href={homeHref} aria-label="Playpiso">
        <img className={styles.logo} src={logoSrc} alt={logoAlt} />
      </a>

      {hasNavigation && (
        <nav className={styles.navigation} aria-label="Navegação principal">
          {navItems.map((item) => (
            <a className={styles.navLink} href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      )}

      <div className={styles.actions}>{actions}</div>
    </header>
  )
}

export type { HeaderNavItem, HeaderProps }
export default Header
