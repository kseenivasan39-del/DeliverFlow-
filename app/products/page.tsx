
import Link from 'next/link';
import { dashboardProducts } from '@/data/mockProducts';

export default function ProductsList() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#062E6F]">Products</h1>
        <Link href="/products/new" className="bg-[#0969DA] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
          + New Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <th className="p-4 font-medium">MPN</th>
              <th className="p-4 font-medium">Brand</th>
              <th className="p-4 font-medium">Description</th>
              <th className="p-4 font-medium">Confidence</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dashboardProducts.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4"><Link href={`/products/${p.id}`} className="text-[#0969DA] font-medium hover:underline">{p.mpn}</Link></td>
                <td className="p-4">{p.brand}</td>
                <td className="p-4 text-slate-500">{p.description}</td>
                <td className="p-4 font-medium">{p.confidence}%</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${p.status === 'Verified' ? 'bg-[#ECFDF3] text-[#16A34A]' : 'bg-red-50 text-[#DC2626]'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
