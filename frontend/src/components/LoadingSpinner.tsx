import styles from './LoadingSpinner.module.css';

const LoadingSpinner = () => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.scanner}>
        <span></span>
      </div>
      <p className={styles.loadingText}>Анализируем пространство...</p>
    </div>
  );
};

export default LoadingSpinner;
