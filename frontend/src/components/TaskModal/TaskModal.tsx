import { useState, useEffect } from 'react';
import { TASK_STATUSES } from "./../../types/task";
import styles from './TaskModal.module.css';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTask: (taskData: { titulo: string; descricao?: string; status: typeof TASK_STATUSES[number] }) => Promise<void>;
}

export function TaskModal({ isOpen, onClose, onAddTask }: TaskModalProps) {
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Limpa o formulário quando a modal é fechada
    useEffect(() => {
        if (!isOpen) {
            setTitulo('');
            setDescricao('');
            setError('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titulo.trim()) {
            setError('O título é obrigatório.');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            // A nova tarefa sempre começa como "A Fazer"
            await onAddTask({ titulo, descricao, status: 'A Fazer' });
            onClose(); // Fecha a modal após sucesso
        } catch (err) {
            console.error(err);
            setError('Falha ao criar a tarefa. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2>Adicionar Nova Tarefa</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </header>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <p className={styles.formError}>{error}</p>}

                    <div className={styles.formGroup}>
                        <label htmlFor="titulo">Título</label>
                        <input
                            type="text"
                            id="titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ex: Corrigir bug no login"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="descricao">Descrição (Opcional)</label>
                        <textarea
                            id="descricao"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Ex: O usuário não consegue acessar..."
                            rows={4}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.buttonSecondary}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.buttonPrimary}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}