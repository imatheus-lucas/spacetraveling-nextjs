import styles from './header.module.scss';
export default function Header() {
  return (
    <header className={styles.container}>
      <img loading="lazy" src="/assets/logo.svg" />
    </header>
  );
}
