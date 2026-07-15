const styles = {
  gold: 'inline-block cursor-pointer rounded-md bg-linear-135 from-gold-soft to-gold-deep font-semibold tracking-[.6px] text-ink shadow-[0_4px_18px_rgba(212,175,55,.35)] transition-shadow duration-250 hover:shadow-[0_6px_24px_rgba(212,175,55,.55)]',
  outline:
    'inline-block cursor-pointer rounded-md border border-gold/55 font-medium tracking-[.5px] text-gold-bright transition-colors duration-250 hover:bg-gold/8 hover:text-gold-bright',
}

const sizes = {
  md: 'px-[26px] py-[11px] text-[15px]',
  lg: 'px-8 py-[15px] text-base',
}

export default function Button({ href, variant = 'gold', size = 'md', className = '', children, ...rest }) {
  const classes = `${styles[variant]} ${sizes[size]} ${className}`
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}
