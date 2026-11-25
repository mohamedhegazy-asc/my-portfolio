import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Download,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  FileSpreadsheet,
  AlertCircle,
  Code2,
  Eye
} from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'

const MAX_PREVIEW_BYTES = 10 * 1024 * 1024 // 10 MB
const INITIAL_ROW_LIMIT = 1000
const INITIAL_COL_LIMIT = 50
const MAX_CELL_DISPLAY_LEN = 240
const ROW_HEIGHT = 32
const OVERSCAN = 15

// Convert 1-based column index to Excel column letters (1 -> A, 27 -> AA)
function colToLetter(col) {
  let n = col
  let str = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    str = String.fromCharCode(65 + rem) + str
    n = Math.floor((n - 1) / 26)
  }
  return str
}

// Parse A1-style reference to { r, c } (1-based)
function parseCellRef(ref) {
  const match = /^([A-Z]+)(\d+)$/i.exec(ref.trim())
  if (!match) return null
  const letters = match[1].toUpperCase()
  const row = parseInt(match[2], 10)
  let col = 0
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64)
  }
  return { r: row, c: col }
}

// Parse merge range like "A1:C2"
function parseMergeRange(rangeStr) {
  const [startStr, endStr] = String(rangeStr).split(':')
  if (!startStr || !endStr) return null
  const s = parseCellRef(startStr)
  const e = parseCellRef(endStr)
  if (!s || !e) return null
  return {
    sr: Math.min(s.r, e.r),
    sc: Math.min(s.c, e.c),
    er: Math.max(s.r, e.r),
    ec: Math.max(s.c, e.c)
  }
}

function formatBytes(bytes = 0) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

// Format cell values respecting Excel number formats (dates, %, currency, decimals)
function formatCellValue(rawVal, numFmt = '') {
  if (rawVal === null || rawVal === undefined) return ''

  // Unwrap ExcelJS composite values
  let val = rawVal
  if (typeof val === 'object' && !(val instanceof Date)) {
    if ('result' in val && val.result !== undefined) {
      val = val.result
    } else if ('richText' in val && Array.isArray(val.richText)) {
      val = val.richText.map(rt => rt.text || '').join('')
    } else if ('text' in val) {
      val = val.text
    } else if ('error' in val) {
      return String(val.error)
    }
  }

  if (val === null || val === undefined) return ''

  if (val instanceof Date && !isNaN(val.getTime())) {
    const fmt = String(numFmt || '').toLowerCase()
    if (fmt.includes('h') || fmt.includes('s')) {
      return val.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    return val.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (typeof val === 'number' && Number.isFinite(val)) {
    const fmt = String(numFmt || '')
    // Percentage format
    if (fmt.includes('%')) {
      const decimals = (fmt.split('.')[1] || '').replace(/[^0#]/g, '').length
      return `${(val * 100).toFixed(Math.min(4, decimals))}%`
    }
    // Currency format
    const currencyMatch = /(\$|€|£|EGP|SAR|AED)/i.exec(fmt)
    if (currencyMatch) {
      const symbol = currencyMatch[1]
      const decimals = fmt.includes('.') ? 2 : 0
      const formatted = val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })
      return symbol.length > 1 ? `${formatted} ${symbol}` : `${symbol}${formatted}`
    }
    // Number with thousands separator or decimals
    if (fmt.includes(',') || fmt.includes('.')) {
      const decimals = fmt.includes('.') ? Math.min(4, (fmt.split('.')[1] || '').replace(/[^0#]/g, '').length) : 0
      return val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })
    }
    return String(val)
  }

  return String(val)
}

// Parse CSV text into a 2D array safely (plain text only)
function parseCsvText(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        field += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        row.push(field)
        field = ''
      } else if (ch === '\r' && next === '\n') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
        i++
      } else if (ch === '\n' || ch === '\r') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      } else {
        field += ch
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

export default function ExcelViewer({ asset }) {
  const { lang } = useLang()
  const assetId = asset?.id || asset?._id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sheets, setSheets] = useState([])
  const [activeSheetIdx, setActiveSheetIdx] = useState(0)
  const [selectedCell, setSelectedCell] = useState({ r: 1, c: 1 })
  const [showFormulas, setShowFormulas] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [copiedFormula, setCopiedFormula] = useState(false)
  const [copiedCsv, setCopiedCsv] = useState(false)
  const [rowLimit, setRowLimit] = useState(INITIAL_ROW_LIMIT)
  const [colLimit, setColLimit] = useState(INITIAL_COL_LIMIT)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(440)

  const gridRef = useRef(null)
  const trackedViewRef = useRef(null)

  // Track view once per asset on first render
  useEffect(() => {
    if (!assetId || trackedViewRef.current === assetId) return
    trackedViewRef.current = assetId
    fetch(`/api/assets/${assetId}/view`, { method: 'POST' }).catch(() => {})
  }, [assetId])

  // Fetch & parse spreadsheet
  useEffect(() => {
    let cancelled = false

    async function loadWorkbook() {
      if (!asset?.url) {
        setError(t(lang, 'viewer.parseError'))
        setLoading(false)
        return
      }

      if (asset.size && asset.size > MAX_PREVIEW_BYTES) {
        setError(t(lang, 'viewer.fileTooLarge'))
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const res = await fetch(asset.url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const buffer = await res.arrayBuffer()
        if (buffer.byteLength > MAX_PREVIEW_BYTES) {
          if (!cancelled) {
            setError(t(lang, 'viewer.fileTooLarge'))
            setLoading(false)
          }
          return
        }

        const isCsv = asset.kind === 'csv' || /\.csv(\?|$)/i.test(asset.url)

        if (isCsv) {
          const text = new TextDecoder('utf-8').decode(buffer)
          const matrix = parseCsvText(text)
          const totalRows = Math.max(1, matrix.length)
          const totalCols = Math.max(1, ...matrix.map(r => r.length))
          const cells = new Map()
          matrix.forEach((rVals, rIdx) => {
            rVals.forEach((v, cIdx) => {
              const str = String(v ?? '')
              if (str !== '') {
                cells.set(`${rIdx + 1}:${cIdx + 1}`, {
                  display: str,
                  formula: null
                })
              }
            })
          })
          if (!cancelled) {
            setSheets([{ name: asset.title || 'CSV', totalRows, totalCols, cells, merges: [] }])
            setActiveSheetIdx(0)
            setSelectedCell({ r: 1, c: 1 })
            setLoading(false)
          }
          return
        }

        // Dynamic import so ExcelJS never enters main bundle
        const ExcelJSModule = await import('exceljs')
        const ExcelJS = ExcelJSModule.default || ExcelJSModule
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(buffer)

        const parsedSheets = workbook.worksheets.map((ws) => {
          const cells = new Map()
          let maxRow = ws.rowCount || 1
          let maxCol = ws.columnCount || 1

          ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
            if (rowNum > maxRow) maxRow = rowNum
            row.eachCell({ includeEmpty: false }, (cell, colNum) => {
              if (colNum > maxCol) maxCol = colNum
              const formulaText = cell.formula
                ? `=${String(cell.formula).replace(/^=/, '')}`
                : (cell.model?.sharedFormula ? `=${String(cell.model.sharedFormula).replace(/^=/, '')}` : null)

              const formatted = formatCellValue(cell.value, cell.numFmt)
              cells.set(`${rowNum}:${colNum}`, {
                display: formatted,
                formula: formulaText
              })
            })
          })

          const rawMerges = ws.model?.merges || []
          const merges = rawMerges.map(parseMergeRange).filter(Boolean)

          return {
            name: ws.name || 'Sheet',
            totalRows: Math.max(1, maxRow),
            totalCols: Math.max(1, maxCol),
            cells,
            merges
          }
        })

        if (!cancelled) {
          if (parsedSheets.length === 0) {
            throw new Error('No worksheets found')
          }
          setSheets(parsedSheets)
          setActiveSheetIdx(0)
          setSelectedCell({ r: 1, c: 1 })
          setLoading(false)
        }
      } catch (err) {
        console.error('ExcelViewer parse error:', err)
        if (!cancelled) {
          setError(t(lang, 'viewer.parseError'))
          setLoading(false)
        }
      }
    }

    loadWorkbook()
    return () => { cancelled = true }
  }, [asset?.url, asset?.size, asset?.kind, asset?.title, lang])

  // Measure container height for virtualization
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const updateHeight = () => setContainerHeight(el.clientHeight || 440)
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [fullscreen, loading])

  const activeSheet = sheets[activeSheetIdx] || null
  const visibleRowsCount = activeSheet ? Math.min(activeSheet.totalRows, rowLimit) : 0
  const visibleColsCount = activeSheet ? Math.min(activeSheet.totalCols, colLimit) : 0

  // Build merge lookup maps for the active sheet
  const mergeInfo = useMemo(() => {
    const masterMap = new Map()
    const coveredSet = new Set()
    if (!activeSheet) return { masterMap, coveredSet }

    for (const m of activeSheet.merges) {
      masterMap.set(`${m.sr}:${m.sc}`, {
        rowSpan: m.er - m.sr + 1,
        colSpan: m.ec - m.sc + 1
      })
      for (let r = m.sr; r <= m.er; r++) {
        for (let c = m.sc; c <= m.ec; c++) {
          if (r !== m.sr || c !== m.sc) {
            coveredSet.add(`${r}:${c}`)
          }
        }
      }
    }
    return { masterMap, coveredSet }
  }, [activeSheet])

  // Row windowing when sheet is large and has no merges crossing window boundaries
  const useWindowing = visibleRowsCount > 150 && mergeInfo.coveredSet.size === 0
  const startRow = useWindowing
    ? Math.max(1, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN + 1)
    : 1
  const endRow = useWindowing
    ? Math.min(visibleRowsCount, startRow + Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN * 2)
    : visibleRowsCount

  const topSpacerHeight = useWindowing ? (startRow - 1) * ROW_HEIGHT : 0
  const bottomSpacerHeight = useWindowing ? Math.max(0, (visibleRowsCount - endRow) * ROW_HEIGHT) : 0

  const selectedAddress = `${colToLetter(selectedCell.c)}${selectedCell.r}`
  const selectedCellData = activeSheet?.cells.get(`${selectedCell.r}:${selectedCell.c}`) || null
  const formulaBarText = selectedCellData?.formula || selectedCellData?.display || ''

  const copyText = useCallback(async (text, onDone) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      onDone()
    } catch {}
  }, [])

  const handleDownload = async () => {
    let downloadUrl = asset?.url
    if (assetId) {
      try {
        const res = await fetch(`/api/assets/${assetId}/download`, { method: 'POST' })
        if (res.ok) {
          const json = await res.json()
          if (json?.data?.url) downloadUrl = json.data.url
        }
      } catch {}
    }
    if (downloadUrl) {
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = asset?.originalName || asset?.title || 'spreadsheet.xlsx'
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleCopyCsv = () => {
    if (!activeSheet) return
    const lines = []
    for (let r = 1; r <= activeSheet.totalRows; r++) {
      const rowCells = []
      for (let c = 1; c <= activeSheet.totalCols; c++) {
        const val = activeSheet.cells.get(`${r}:${c}`)?.display || ''
        const escaped = /[",\n\r]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val
        rowCells.push(escaped)
      }
      lines.push(rowCells.join(','))
    }
    copyText(lines.join('\n'), () => {
      setCopiedCsv(true)
      setTimeout(() => setCopiedCsv(false), 2000)
    })
  }

  const handleGridKeyDown = (e) => {
    if (!activeSheet) return
    const { r, c } = selectedCell
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedCell({ r: Math.min(visibleRowsCount, r + 1), c })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedCell({ r: Math.max(1, r - 1), c })
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setSelectedCell({ r, c: Math.min(visibleColsCount, c + 1) })
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setSelectedCell({ r, c: Math.max(1, c - 1) })
    }
  }

  const wrapperClass = fullscreen
    ? 'fixed inset-0 z-50 bg-[#222936] flex flex-col p-3 sm:p-5 overflow-hidden'
    : 'rounded-2xl bg-[#222936] border border-[#374159] shadow-xl overflow-hidden flex flex-col'

  return (
    <div className={wrapperClass}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#1a2130] border-b border-[#374159]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#374159] flex items-center justify-center text-[#B9D895] shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate" dir="auto">
              {asset?.title || asset?.originalName || 'Spreadsheet'}
            </h4>
            <p className="text-[11px] text-[#E0F6C4]/60">
              {formatBytes(asset?.size)}
              {sheets.length > 0 && ` • ${sheets.length} ${sheets.length === 1 ? t(lang, 'viewer.sheet') : t(lang, 'viewer.sheets')}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sheets.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowFormulas(f => !f)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  showFormulas
                    ? 'bg-[#B9D895] text-[#222936] border-[#B9D895] font-bold'
                    : 'border-[#374159] text-[#E0F6C4]/80 hover:border-[#B9D895]/60'
                }`}
              >
                {showFormulas ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                <span>{showFormulas ? t(lang, 'viewer.showValues') : t(lang, 'viewer.showFormulas')}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCsv}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#374159] text-[#E0F6C4]/80 hover:border-[#B9D895]/60 transition-colors cursor-pointer"
              >
                {copiedCsv ? <Check className="w-3.5 h-3.5 text-[#B9D895]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCsv ? t(lang, 'viewer.copied') : t(lang, 'viewer.copyAsCsv')}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#B9D895] hover:bg-[#a6ca7f] text-[#222936] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t(lang, 'viewer.downloadOriginal')}</span>
          </button>

          <button
            type="button"
            onClick={() => setFullscreen(f => !f)}
            aria-label={fullscreen ? t(lang, 'viewer.exitFullscreen') : t(lang, 'viewer.fullscreen')}
            className="p-1.5 rounded-lg border border-[#374159] text-[#E0F6C4]/80 hover:border-[#B9D895]/60 transition-colors cursor-pointer"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-8 bg-[#374159]/50 rounded-lg w-full" />
          <div className="h-64 bg-[#374159]/30 rounded-lg w-full" />
          <p className="text-xs text-[#E0F6C4]/60 text-center">{t(lang, 'viewer.loadingFile')}</p>
        </div>
      )}

      {/* Friendly Error + Download fallback */}
      {!loading && error && (
        <div className="p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-[#E0F6C4]/80 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full bg-[#B9D895] text-[#222936] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t(lang, 'viewer.downloadOriginal')}</span>
          </button>
        </div>
      )}

      {/* Formula Bar & Spreadsheet Grid (always LTR) */}
      {!loading && !error && activeSheet && (
        <>
          {/* Formula Bar */}
          <div
            dir="ltr"
            className="flex items-center gap-2 px-3 py-2 bg-[#1e2635] border-b border-[#374159] text-xs"
          >
            <span className="px-2.5 py-1 rounded bg-[#374159] text-[#B9D895] font-mono font-bold min-w-[48px] text-center">
              {selectedAddress}
            </span>
            {selectedCellData?.formula && (
              <span className="px-1.5 py-0.5 rounded bg-[#B9D895]/20 text-[#B9D895] font-mono font-bold text-[10px]">
                fx
              </span>
            )}
            <div className="flex-1 min-w-0 font-mono text-[#E0F6C4]/90 truncate px-2 py-1 rounded bg-[#222936] border border-[#374159]/60">
              {formulaBarText ? formulaBarText.slice(0, 2000) : (
                <span className="text-[#E0F6C4]/35 italic">{t(lang, 'viewer.emptyCell')}</span>
              )}
            </div>
            <button
              type="button"
              disabled={!formulaBarText}
              onClick={() => copyText(formulaBarText, () => {
                setCopiedFormula(true)
                setTimeout(() => setCopiedFormula(false), 2000)
              })}
              aria-live="polite"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#374159] text-[#E0F6C4]/80 hover:border-[#B9D895] hover:text-[#B9D895] disabled:opacity-40 transition-colors cursor-pointer shrink-0"
            >
              {copiedFormula ? <Check className="w-3.5 h-3.5 text-[#B9D895]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFormula ? t(lang, 'viewer.copied') : t(lang, 'viewer.copy')}</span>
            </button>
          </div>

          {/* Scrollable Spreadsheet Grid */}
          <div
            ref={gridRef}
            dir="ltr"
            tabIndex={0}
            role="grid"
            aria-label={asset?.title || 'Spreadsheet grid'}
            onKeyDown={handleGridKeyDown}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
            className={`overflow-auto outline-none select-text ${fullscreen ? 'flex-1' : 'max-h-[440px]'}`}
          >
            <table className="border-collapse text-xs font-mono text-[#E0F6C4]/90 min-w-full">
              <thead>
                <tr className="sticky top-0 z-20 bg-[#1a2130]">
                  <th className="sticky left-0 z-30 w-12 min-w-[48px] h-8 bg-[#1a2130] border-b border-r border-[#374159] text-[#E0F6C4]/50 font-semibold text-center">
                    #
                  </th>
                  {Array.from({ length: visibleColsCount }, (_, i) => i + 1).map((colIdx) => (
                    <th
                      key={colIdx}
                      className="h-8 min-w-[110px] px-2 bg-[#1a2130] border-b border-r border-[#374159] text-[#B9D895] font-semibold text-center"
                    >
                      {colToLetter(colIdx)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topSpacerHeight > 0 && (
                  <tr style={{ height: topSpacerHeight }}>
                    <td colSpan={visibleColsCount + 1} />
                  </tr>
                )}

                {Array.from({ length: endRow - startRow + 1 }, (_, i) => startRow + i).map((rowIdx) => (
                  <tr
                    key={rowIdx}
                    role="row"
                    className={rowIdx % 2 === 0 ? 'bg-[#273040]/60' : 'bg-[#222936]'}
                    style={{ height: ROW_HEIGHT }}
                  >
                    <th
                      scope="row"
                      className="sticky left-0 z-10 w-12 min-w-[48px] bg-[#1e2635] border-b border-r border-[#374159] text-[#E0F6C4]/50 font-medium text-center select-none"
                    >
                      {rowIdx}
                    </th>

                    {Array.from({ length: visibleColsCount }, (_, i) => i + 1).map((colIdx) => {
                      const key = `${rowIdx}:${colIdx}`
                      if (mergeInfo.coveredSet.has(key)) return null

                      const merge = mergeInfo.masterMap.get(key)
                      const cell = activeSheet.cells.get(key)
                      const isSelected = selectedCell.r === rowIdx && selectedCell.c === colIdx
                      const rawText = showFormulas && cell?.formula
                        ? cell.formula
                        : (cell?.display ?? '')
                      const text = rawText.length > MAX_CELL_DISPLAY_LEN
                        ? `${rawText.slice(0, MAX_CELL_DISPLAY_LEN)}…`
                        : rawText

                      return (
                        <td
                          key={colIdx}
                          role="gridcell"
                          aria-selected={isSelected}
                          rowSpan={merge?.rowSpan}
                          colSpan={merge?.colSpan}
                          onClick={() => setSelectedCell({ r: rowIdx, c: colIdx })}
                          className={`relative px-2.5 py-1 border-b border-r border-[#374159]/60 max-w-[260px] truncate cursor-cell ${
                            isSelected ? 'ring-2 ring-inset ring-[#B9D895] bg-[#374159]/70' : ''
                          }`}
                        >
                          {cell?.formula && (
                            <span className="inline-block text-[9px] font-bold text-[#B9D895] mr-1 select-none">
                              fx
                            </span>
                          )}
                          <span>{text}</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}

                {bottomSpacerHeight > 0 && (
                  <tr style={{ height: bottomSpacerHeight }}>
                    <td colSpan={visibleColsCount + 1} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Show More controls for sheets > 1000 rows or > 50 cols */}
          {(activeSheet.totalRows > rowLimit || activeSheet.totalCols > colLimit) && (
            <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-2 bg-[#1e2635] border-t border-[#374159]">
              {activeSheet.totalRows > rowLimit && (
                <button
                  type="button"
                  onClick={() => setRowLimit(l => l + 1000)}
                  className="text-xs font-semibold text-[#B9D895] hover:underline cursor-pointer"
                >
                  {t(lang, 'viewer.showMoreRows')} ({visibleRowsCount} / {activeSheet.totalRows})
                </button>
              )}
              {activeSheet.totalCols > colLimit && (
                <button
                  type="button"
                  onClick={() => setColLimit(c => c + 50)}
                  className="text-xs font-semibold text-[#B9D895] hover:underline cursor-pointer"
                >
                  {t(lang, 'viewer.showMoreCols')} ({visibleColsCount} / {activeSheet.totalCols})
                </button>
              )}
            </div>
          )}

          {/* Sheet Tabs at bottom */}
          <div className="flex items-center justify-between gap-3 px-3 py-2 bg-[#1a2130] border-t border-[#374159]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {sheets.map((s, idx) => (
                <button
                  key={`${s.name}-${idx}`}
                  type="button"
                  onClick={() => {
                    setActiveSheetIdx(idx)
                    setSelectedCell({ r: 1, c: 1 })
                    setScrollTop(0)
                    if (gridRef.current) gridRef.current.scrollTop = 0
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    idx === activeSheetIdx
                      ? 'bg-[#B9D895] text-[#222936]'
                      : 'bg-[#374159]/40 text-[#E0F6C4]/70 hover:text-white'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-2 bg-[#1a2130]/70 border-t border-[#374159]/40 text-[11px] text-[#E0F6C4]/50">
            {t(lang, 'viewer.limitationsNote')}
          </div>
        </>
      )}
    </div>
  )
}
