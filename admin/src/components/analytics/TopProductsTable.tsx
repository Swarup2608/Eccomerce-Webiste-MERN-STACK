export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export default function TopProductsTable({ products, currency }: { products: TopProduct[]; currency: string }) {
  if (products.length === 0) {
    return <p className="text-muted">No sales in this period yet.</p>;
  }
  return (
    <div className="table-scroll">
    <table className="table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Units sold</th>
          <th style={{ textAlign: 'right' }}>Revenue</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p, i) => (
          <tr key={p.productId || i}>
            <td>{p.name}</td>
            <td style={{ color: 'var(--color-neutral-400)' }}>{p.quantity}</td>
            <td style={{ textAlign: 'right' }}>{currency}{p.revenue}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
