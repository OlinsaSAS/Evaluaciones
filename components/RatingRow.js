export default function RatingRow({ num, nombre, detalle, value, onChange }) {
  return (
    <div className="rating-row">
      <div className="rating-num">{num}</div>
      <div className="rating-desc">
        <strong>{nombre}</strong>
        {detalle && <small>{detalle}</small>}
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map(v => (
            <button
              key={v}
              type="button"
              className={`star-btn s${v}${value === v ? ' active' : ''}`}
              onClick={() => onChange(v)}
              title={['Insatisfactorio', 'Por debajo', 'Cumple', 'Por encima', 'Excepcional'][v - 1]}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
