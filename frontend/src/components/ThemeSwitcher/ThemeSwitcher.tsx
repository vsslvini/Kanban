import { useTheme } from '../../contexts/ThemeContext';
import styles from './ThemeSwitcher.module.css';

export function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={styles.themeButton}
            aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}