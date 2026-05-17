/**
 * Colored badge showing the investment layer number (L1–L4).
 *
 * @param {{ id: number }} props
 */
const LayerBadge = ({ id }) => {
  const colors = ['', '#5e6ad2', '#7170ff', '#828fff', '#8b5cf6'];
  return (
    <span
      aria-label={`Layer ${id}`}
      style={{
        background: colors[id] || '#5e6ad2',
        color: 'white',
        padding: '1px 6px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 500,
      }}
    >
      L{id}
    </span>
  );
};

export default LayerBadge;
