import { Badge } from './Badge.jsx'
import { ENGINEERING } from '../data/engineering.js'

export function EngineeringTable({ showWhy = false }) {
  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full min-w-[480px] border-collapse text-left text-body">
        <thead className="bg-bg">
          <tr>
            <th scope="col" className="label-caps px-4 py-3 font-medium">Feature</th>
            <th scope="col" className="label-caps px-4 py-3 font-medium">Technique</th>
            <th scope="col" className="label-caps px-4 py-3 text-right font-medium">Complexity</th>
          </tr>
        </thead>
        <tbody className="bg-bg-elevated">
          {ENGINEERING.map((row) => (
            <tr key={row.feature} className="border-t border-border">
              <td className="px-4 py-3.5 align-top font-medium">{row.feature}</td>
              <td className="px-4 py-3.5 align-top">
                <div className="text-text">{row.technique}</div>
                {showWhy && <div className="mt-0.5 text-xs text-text-faint">{row.why}</div>}
                <code className="num mt-1 block text-[11px] text-text-faint">{row.file}</code>
              </td>
              <td className="px-4 py-3.5 text-right align-top">
                <Badge tone="accent" className="num">
                  {row.complexity}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
