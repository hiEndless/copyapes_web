type CompareRow = {
  left: string
  right: string
}

type CompareTableProps = {
  leftHeader?: string
  rightHeader?: string
  rows: CompareRow[] | Array<[string, string]>
}

function normalizeRows(rows: CompareTableProps['rows']): CompareRow[] {
  return rows.map(row => (Array.isArray(row) ? { left: row[0], right: row[1] } : row))
}

const CompareTable = ({
  leftHeader = '你以为的现象',
  rightHeader = '背后的机制',
  rows
}: CompareTableProps) => {
  const items = normalizeRows(rows)

  return (
    <div className='border-border my-8 overflow-hidden rounded-xl border'>
      <div className='border-border bg-muted/40 hidden grid-cols-2 border-b md:grid'>
        <div className='text-foreground px-4 py-3 text-sm font-semibold'>{leftHeader}</div>
        <div className='text-foreground border-border border-l px-4 py-3 text-sm font-semibold'>
          {rightHeader}
        </div>
      </div>

      <ul className='divide-border divide-y'>
        {items.map((item, index) => (
          <li key={`${item.left}-${index}`} className='grid grid-cols-1 md:grid-cols-2'>
            <div className='px-4 py-4'>
              <p className='text-muted-foreground mb-1 text-xs md:hidden'>{leftHeader}</p>
              <p className='text-muted-foreground text-[15px] leading-7'>{item.left}</p>
            </div>
            <div className='border-border bg-muted/20 border-t px-4 py-4 md:border-t-0 md:border-l'>
              <p className='text-foreground/70 mb-1 text-xs md:hidden'>{rightHeader}</p>
              <p className='text-foreground text-[15px] leading-7'>{item.right}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CompareTable
