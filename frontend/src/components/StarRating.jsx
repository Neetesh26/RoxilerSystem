export function StarRating({ value, onChange, size = 'normal' }) {
  const stars = [1, 2, 3, 4, 5];
  const isInteractive = typeof onChange === 'function';

  return (
    <div className={`stars ${!isInteractive ? 'stars-static' : ''}`}>
      {stars.map((s) => (
        <span
          key={s}
          className={`star ${s <= value ? 'filled' : ''}`}
          onClick={() => isInteractive && onChange(s)}
          style={{ fontSize: size === 'large' ? '2rem' : undefined }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function RatingDisplay({ value }) {
  const num = parseFloat(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <StarRating value={Math.round(num)} />
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {num > 0 ? num.toFixed(1) : 'No ratings'}
      </span>
    </div>
  );
}
