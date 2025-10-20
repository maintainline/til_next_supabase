import styles from './SCSSTest.module.scss';

export default function SCSSTest() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>SCSS 테스트 컴포넌트</h2>
      <p className={styles.description}>
        이 컴포넌트는 SCSS 모듈을 사용하여 스타일링됩니다.
      </p>
      <div className={styles.buttonGroup}>
        <button className={styles.primaryButton}>Primary Button</button>
        <button className={styles.secondaryButton}>Secondary Button</button>
      </div>
      <div className={styles.card}>
        <h3>SCSS 카드</h3>
        <p>이 카드는 SCSS 믹스인을 사용하여 스타일링되었습니다.</p>
      </div>
    </div>
  );
}
