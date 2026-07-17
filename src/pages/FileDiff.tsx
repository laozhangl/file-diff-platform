import React, { useState, useCallback, useEffect } from 'react'

interface DiffResult {
  type: 'added' | 'removed' | 'modified' | 'same'
  oldLine: string
  newLine: string
  oldLineNumber: number
  newLineNumber: number
}

interface DiffSummary {
  totalLines: number
  addedLines: number
  removedLines: number
  modifiedLines: number
  sameLines: number
}

type FilterType = 'all' | 'added' | 'removed' | 'modified' | 'same'

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function FileDiff() {
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [contentA, setContentA] = useState('')
  const [contentB, setContentB] = useState('')
  const [diffResults, setDiffResults] = useState<DiffResult[]>([])
  const [summary, setSummary] = useState<DiffSummary | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all')

  // 配置相关
  const [detectedColumns, setDetectedColumns] = useState<string[]>([])
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set())
  const [enabledDiffTypes, setEnabledDiffTypes] = useState<Set<string>>(new Set(['added', 'removed', 'modified']))
  const [showConfig, setShowConfig] = useState(false)
  const [isStructuredFile, setIsStructuredFile] = useState(false)
  const [exportFormat, setExportFormat] = useState('json')
  const [keepHeaders, setKeepHeaders] = useState(true)

  const readFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }, [])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'A' | 'B') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (fileType === 'A') {
      setFileA(file)
      const content = await readFile(file)
      setContentA(content)
    } else {
      setFileB(file)
      const content = await readFile(file)
      setContentB(content)
    }
  }, [readFile])

  const parseCSVLine = (line: string, delimiter: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())

    return result.map(cell => cell.replace(/^["']|["']$/g, ''))
  }

  const detectColumns = (content: string, fileName: string): string[] | null => {
    if (!content) return null

    let cleanedContent = content
    if (content.charCodeAt(0) === 0xFEFF) {
      cleanedContent = content.substring(1)
    }

    const lines = cleanedContent.split('\n').filter(line => line.trim())
    if (lines.length < 2) return null

    const firstLine = lines[0]
    const lowerName = fileName.toLowerCase()

    let delimiter = ','
    if (firstLine.includes('\t')) delimiter = '\t'
    else if (firstLine.includes('|')) delimiter = '|'
    else if (firstLine.includes(';')) delimiter = ';'
    else if (firstLine.includes(',')) delimiter = ','
    else if (lowerName.endsWith('.tsv')) delimiter = '\t'
    else if (lowerName.endsWith('.csv')) delimiter = ','
    else if (lowerName.endsWith('.json')) return null

    const headers = parseCSVLine(firstLine, delimiter)

    if (headers.length < 2) return null

    if (lowerName.endsWith('.csv') || lowerName.endsWith('.tsv')) {
      return headers
    }

    if (lines.length >= 2) {
      const secondLineCols = parseCSVLine(lines[1], delimiter).length
      if (Math.abs(secondLineCols - headers.length) <= 1) {
        return headers
      }
    }

    const hasHeaderKeywords = headers.some(h =>
      h.toLowerCase().includes('name') ||
      h.toLowerCase().includes('id') ||
      h.toLowerCase().includes('date') ||
      h.toLowerCase().includes('time') ||
      h.toLowerCase().includes('编号') ||
      h.toLowerCase().includes('名称') ||
      h.toLowerCase().includes('日期') ||
      h.toLowerCase().includes('时间') ||
      h.toLowerCase().includes('字段')
    )

    if (hasHeaderKeywords && lines.length >= 2) {
      return headers
    }

    return null
  }

  const detectAndSetColumns = (cA: string, cB: string, nA: string, nB: string) => {
    if (!cA || !cB) return
    const colsA = detectColumns(cA, nA)
    const colsB = detectColumns(cB, nB)

    if (colsA && colsB) {
      const allCols = Array.from(new Set([...colsA, ...colsB]))
      setDetectedColumns(allCols)
      setSelectedColumns(new Set(allCols))
      setIsStructuredFile(true)
    } else {
      setDetectedColumns([])
      setSelectedColumns(new Set())
      setIsStructuredFile(false)
      setShowConfig(false)
    }
  }

  const toggleColumn = (col: string) => {
    const next = new Set(selectedColumns)
    if (next.has(col)) next.delete(col)
    else next.add(col)
    setSelectedColumns(next)
  }

  const selectAllCols = () => setSelectedColumns(new Set(detectedColumns))
  const deselectAllCols = () => setSelectedColumns(new Set())

  const toggleDiffType = (type: string) => {
    const next = new Set(enabledDiffTypes)
    if (next.has(type)) next.delete(type)
    else next.add(type)
    setEnabledDiffTypes(next)
  }

  const parseStructuredFile = (content: string): { lines: string[]; delimiter: string } => {
    let cleanedContent = content
    if (content.charCodeAt(0) === 0xFEFF) {
      cleanedContent = content.substring(1)
    }

    const lines = cleanedContent.split('\n').filter(l => l.trim())
    if (lines.length === 0) return { lines: [], delimiter: ',' }

    const firstLine = lines[0]
    let delimiter = ','
    if (firstLine.includes('\t')) delimiter = '\t'
    else if (firstLine.includes('|')) delimiter = '|'
    else if (firstLine.includes(';')) delimiter = ';'
    else if (firstLine.includes(',')) delimiter = ','

    const headers = parseCSVLine(firstLine, delimiter)
    const selectedIdx = headers.map((h, idx) => selectedColumns.has(h) ? idx : -1).filter(i => i !== -1)

    const result: string[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i], delimiter)
      result.push(selectedIdx.map(idx => cols[idx] || '').join(delimiter))
    }
    
    if (keepHeaders) {
      result.unshift(selectedIdx.map(idx => headers[idx]).join(delimiter))
    }
    
    return { lines: result, delimiter }
  }

  useEffect(() => {
    if (contentA && contentB && fileA && fileB) {
      detectAndSetColumns(contentA, contentB, fileA.name, fileB.name)
    }
  }, [contentA, contentB, fileA, fileB])

  const levenshteinDistance = (s: string, t: string): number => {
    const m = s.length
    const n = t.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s[i - 1] === t[j - 1] ? 0 : 1
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        )
      }
    }
    return dp[m][n]
  }

  const compareFiles = useCallback(() => {
    if (!contentA || !contentB) {
      alert('请先上传两个文件')
      return
    }

    if (isStructuredFile && selectedColumns.size === 0) {
      alert('请至少选择一个要比对的列')
      return
    }

    setIsComparing(true)

    let linesA: string[]
    let linesB: string[]

    if (isStructuredFile && detectedColumns.length > 0) {
      const rA = parseStructuredFile(contentA)
      const rB = parseStructuredFile(contentB)
      linesA = rA.lines
      linesB = rB.lines
    } else {
      linesA = contentA.split('\n')
      linesB = contentB.split('\n')
    }

    const results: DiffResult[] = []
    let addedLines = 0
    let removedLines = 0
    let modifiedLines = 0
    let sameLines = 0

    const maxLen = Math.max(linesA.length, linesB.length)

    for (let i = 0; i < maxLen; i++) {
      const lineA = linesA[i] || ''
      const lineB = linesB[i] || ''

      if (lineA === lineB) {
        if (enabledDiffTypes.has('same')) {
          results.push({ type: 'same', oldLine: lineA, newLine: lineB, oldLineNumber: i + 1, newLineNumber: i + 1 })
        }
        sameLines++
      } else if (!lineA) {
        if (enabledDiffTypes.has('added')) {
          results.push({ type: 'added', oldLine: '', newLine: lineB, oldLineNumber: 0, newLineNumber: i + 1 })
        }
        addedLines++
      } else if (!lineB) {
        if (enabledDiffTypes.has('removed')) {
          results.push({ type: 'removed', oldLine: lineA, newLine: '', oldLineNumber: i + 1, newLineNumber: 0 })
        }
        removedLines++
      } else {
        const distance = levenshteinDistance(lineA, lineB)
        const similarity = 1 - (distance / Math.max(lineA.length, lineB.length))

        if (similarity > 0.5) {
          if (enabledDiffTypes.has('modified')) {
            results.push({ type: 'modified', oldLine: lineA, newLine: lineB, oldLineNumber: i + 1, newLineNumber: i + 1 })
          }
          modifiedLines++
        } else {
          if (enabledDiffTypes.has('removed')) {
            results.push({ type: 'removed', oldLine: lineA, newLine: '', oldLineNumber: i + 1, newLineNumber: 0 })
          }
          removedLines++
          if (enabledDiffTypes.has('added')) {
            results.push({ type: 'added', oldLine: '', newLine: lineB, oldLineNumber: 0, newLineNumber: i + 1 })
          }
          addedLines++
        }
      }
    }

    setDiffResults(results)
    setSummary({ totalLines: maxLen, addedLines, removedLines, modifiedLines, sameLines })
    setCurrentFilter('all')
    setIsComparing(false)
  }, [contentA, contentB, isStructuredFile, detectedColumns, selectedColumns, enabledDiffTypes])

  const getFilteredResults = (): DiffResult[] => {
    if (currentFilter === 'all') return diffResults
    return diffResults.filter(r => r.type === currentFilter)
  }

  const exportData = useCallback((format: string) => {
    if (!diffResults.length || !summary) return

    const filtered = getFilteredResults()
    const filterLabels: Record<string, string> = {
      all: '全部',
      added: '新增',
      removed: '删除',
      modified: '修改',
      same: '相同'
    }
    const typeMap: Record<string, string> = {
      added: '新增',
      removed: '删除',
      modified: '修改',
      same: '相同'
    }

    const selectedHeadersList = Array.from(selectedColumns)

    let content = ''
    let mimeType = ''
    let extension = ''

    switch (format) {
      case 'json':
        content = JSON.stringify({
          summary,
          filter: currentFilter,
          fileA: fileA?.name || 'File A',
          fileB: fileB?.name || 'File B',
          selectedColumns: selectedHeadersList,
          keepHeaders: keepHeaders,
          diffResults: filtered,
          totalDiffResults: diffResults.length,
          timestamp: new Date().toISOString()
        }, null, 2)
        mimeType = 'application/json'
        extension = 'json'
        break

      case 'csv':
        {
          let csvContent = ''
          const delimiter = ','
          
          // 构建表头
          if (isStructuredFile && selectedHeadersList.length > 0) {
            // 结构化数据：类型 + 行号 + 每个列分开
            csvContent += '类型,原文件行号,新文件行号'
            selectedHeadersList.forEach(col => {
              csvContent += `,${col}(A)`
            })
            selectedHeadersList.forEach(col => {
              csvContent += `,${col}(B)`
            })
            csvContent += '\n'
          } else {
            // 非结构化数据：类型 + 行号 + 原内容 + 新内容
            csvContent += '类型,原文件行号,新文件行号,原内容,新内容\n'
          }
          
          filtered.forEach(result => {
            if (isStructuredFile && selectedHeadersList.length > 0) {
              // 结构化数据：拆分每个字段到独立列
              const oldCols = result.oldLine ? parseCSVLine(result.oldLine, delimiter) : []
              const newCols = result.newLine ? parseCSVLine(result.newLine, delimiter) : []
              
              csvContent += `${typeMap[result.type]},${result.oldLineNumber || ''},${result.newLineNumber || ''}`
              
              // 填充A文件列
              selectedHeadersList.forEach((_, idx) => {
                const val = oldCols[idx] || ''
                csvContent += `,"${val.replace(/"/g, '""')}"`
              })
              
              // 填充B文件列
              selectedHeadersList.forEach((_, idx) => {
                const val = newCols[idx] || ''
                csvContent += `,"${val.replace(/"/g, '""')}"`
              })
              
              csvContent += '\n'
            } else {
              // 非结构化数据：整行作为一个字段
              const oldLine = result.oldLine ? `"${result.oldLine.replace(/"/g, '""')}"` : '""'
              const newLine = result.newLine ? `"${result.newLine.replace(/"/g, '""')}"` : '""'
              csvContent += `${typeMap[result.type]},${result.oldLineNumber || ''},${result.newLineNumber || ''},${oldLine},${newLine}\n`
            }
          })
          
          // 添加UTF-8 BOM头解决中文乱码
          content = '\uFEFF' + csvContent
          mimeType = 'text/csv;charset=utf-8;'
          extension = 'csv'
        }
        break

      case 'markdown':
        content = `# 文件比对结果\n\n`
        content += `## 比对文件\n\n`
        content += `- 文件 A: ${fileA?.name || 'File A'}\n`
        content += `- 文件 B: ${fileB?.name || 'File B'}\n`
        content += `- 筛选条件: ${filterLabels[currentFilter]}\n`
        if (isStructuredFile && selectedHeadersList.length > 0) {
          content += `- 比对列: ${selectedHeadersList.join(', ')}\n`
          content += `- 保留表头: ${keepHeaders ? '是' : '否'}\n`
        }
        content += `\n`
        content += `## 比对摘要\n\n`
        content += `- 总行数: ${summary.totalLines}\n`
        content += `- 新增行数: ${summary.addedLines}\n`
        content += `- 删除行数: ${summary.removedLines}\n`
        content += `- 修改行数: ${summary.modifiedLines}\n`
        content += `- 相同行数: ${summary.sameLines}\n`
        content += `- 当前显示: ${filtered.length} 行\n\n`
        content += `## 详细差异\n\n`
        content += `| 类型 | 原文件行号 | 新文件行号 | 原内容 | 新内容 |\n`
        content += `| --- | --- | --- | --- | --- |\n`
        if (isStructuredFile && keepHeaders && selectedHeadersList.length > 0) {
          content += `| 表头 | - | - | ${selectedHeadersList.join(', ')} | ${selectedHeadersList.join(', ')} |\n`
        }
        filtered.forEach(result => {
          const oldContent = result.oldLine.replace(/\|/g, '\\|') || '-'
          const newContent = result.newLine.replace(/\|/g, '\\|') || '-'
          content += `| ${typeMap[result.type]} | ${result.oldLineNumber || '-'} | ${result.newLineNumber || '-'} | ${oldContent} | ${newContent} |\n`
        })
        mimeType = 'text/markdown'
        extension = 'md'
        break

      case 'html':
        content = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>文件比对结果</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        h1 { color: #333; text-align: center; }
        .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary p { margin: 8px 0; color: #666; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; color: #495057; border-bottom: 2px solid #dee2e6; }
        td { padding: 12px; border-bottom: 1px solid #e9ecef; font-family: 'Courier New', monospace; }
        tr.added { background: #d4edda; }
        tr.removed { background: #f8d7da; }
        tr.modified { background: #fff3cd; }
        tr.header-row { background: #e3f2fd; }
        .badge { padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; font-weight: 500; }
        .badge.added { background: #c3e6cb; color: #155724; }
        .badge.removed { background: #f5c6cb; color: #721c24; }
        .badge.modified { background: #ffeeba; color: #856404; }
        .badge.same { background: #e2e3e5; color: #383d41; }
        .badge.header-badge { background: #90caf9; color: #0d47a1; }
        .footer { text-align: center; margin-top: 20px; color: #6c757d; font-size: 0.9rem; }
    </style>
</head>
<body>
    <h1>文件比对结果</h1>
    <div class="summary">
        <p><strong>文件 A:</strong> ${escapeHtml(fileA?.name || 'File A')}</p>
        <p><strong>文件 B:</strong> ${escapeHtml(fileB?.name || 'File B')}</p>
        <p><strong>筛选条件:</strong> ${filterLabels[currentFilter]}</p>
        ${isStructuredFile && selectedHeadersList.length > 0 ? `<p><strong>比对列:</strong> ${selectedHeadersList.join(', ')}</p><p><strong>保留表头:</strong> ${keepHeaders ? '是' : '否'}</p>` : ''}
        <p><strong>总行数:</strong> ${summary.totalLines}</p>
        <p><strong>新增:</strong> ${summary.addedLines} | <strong>删除:</strong> ${summary.removedLines} | <strong>修改:</strong> ${summary.modifiedLines} | <strong>相同:</strong> ${summary.sameLines}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>类型</th>
                <th>原文件行号</th>
                <th>新文件行号</th>
                <th>原内容</th>
                <th>新内容</th>
            </tr>
        </thead>
        <tbody>
${(isStructuredFile && keepHeaders && selectedHeadersList.length > 0 ? [`            <tr class="header-row">
                <td><span class="badge header-badge">表头</span></td>
                <td>-</td>
                <td>-</td>
                <td>${escapeHtml(selectedHeadersList.join(', '))}</td>
                <td>${escapeHtml(selectedHeadersList.join(', '))}</td>
            </tr>`] : []).concat(filtered.map(result => `            <tr class="${result.type}">
                <td><span class="badge ${result.type}">${typeMap[result.type]}</span></td>
                <td>${result.oldLineNumber || '-'}</td>
                <td>${result.newLineNumber || '-'}</td>
                <td>${escapeHtml(result.oldLine) || '-'}</td>
                <td>${escapeHtml(result.newLine) || '-'}</td>
            </tr>`)).join('\n')}
        </tbody>
    </table>
    <div class="footer">
        <p>导出时间: ${new Date().toLocaleString('zh-CN')}</p>
    </div>
</body>
</html>`
        mimeType = 'text/html'
        extension = 'html'
        break

      case 'txt':
        content = `文件比对结果\n`
        content += `================\n\n`
        content += `文件 A: ${fileA?.name || 'File A'}\n`
        content += `文件 B: ${fileB?.name || 'File B'}\n`
        content += `筛选条件: ${filterLabels[currentFilter]}\n`
        if (isStructuredFile && selectedHeadersList.length > 0) {
          content += `比对列: ${selectedHeadersList.join(', ')}\n`
          content += `保留表头: ${keepHeaders ? '是' : '否'}\n`
        }
        content += `\n`
        content += `比对摘要:\n`
        content += `- 总行数: ${summary.totalLines}\n`
        content += `- 新增行数: ${summary.addedLines}\n`
        content += `- 删除行数: ${summary.removedLines}\n`
        content += `- 修改行数: ${summary.modifiedLines}\n`
        content += `- 相同行数: ${summary.sameLines}\n`
        content += `- 当前显示: ${filtered.length} 行\n\n`
        content += `详细差异:\n`
        content += `${'='.repeat(80)}\n`
        content += `${'类型'.padEnd(6)} | ${'原行号'.padEnd(8)} | ${'新行号'.padEnd(8)} | 原内容\n`
        content += `${'='.repeat(80)}\n`
        if (isStructuredFile && keepHeaders && selectedHeadersList.length > 0) {
          content += `${'表头'.padEnd(6)} | ${'-'.padEnd(8)} | ${'-'.padEnd(8)} | ${selectedHeadersList.join(', ')}\n`
        }
        filtered.forEach(result => {
          const type = typeMap[result.type].padEnd(6)
          const oldNum = (result.oldLineNumber || '-').toString().padEnd(8)
          const newNum = (result.newLineNumber || '-').toString().padEnd(8)
          content += `${type} | ${oldNum} | ${newNum} | ${result.oldLine || '-'}\n`
          if (result.type === 'modified') {
            content += `${' '.repeat(6)} | ${' '.repeat(8)} | ${' '.repeat(8)} | => ${result.newLine || '-'}\n`
          }
        })
        content += `${'='.repeat(80)}\n`
        content += `\n导出时间: ${new Date().toLocaleString('zh-CN')}\n`
        mimeType = 'text/plain'
        extension = 'txt'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diff_result_${currentFilter}_${Date.now()}.${extension}`
    a.click()
    URL.revokeObjectURL(url)
  }, [diffResults, summary, fileA, fileB, currentFilter, getFilteredResults])

  const clearAll = useCallback(() => {
    setFileA(null)
    setFileB(null)
    setContentA('')
    setContentB('')
    setDiffResults([])
    setSummary(null)
    setCurrentFilter('all')
    setDetectedColumns([])
    setSelectedColumns(new Set())
    setIsStructuredFile(false)
    setShowConfig(false)
    setExportFormat('json')
    setKeepHeaders(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            文件比对平台
          </h1>
          <p className="text-gray-600 text-lg">上传两个文件，自动比对差异并生成详细报告</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-bold text-lg">A</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">原文件 (File A)</h2>
                <p className="text-sm text-gray-500">选择要比对的原始文件</p>
              </div>
            </div>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600">点击或拖拽上传文件</p>
                <p className="text-xs text-gray-400 mt-1">支持 .txt, .md, .json, .csv, .js, .ts 等文本文件</p>
              </div>
              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'A')} />
            </label>
            {fileA && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700 font-medium">{fileA.name}</span>
                </div>
                <span className="text-sm text-green-600">{(fileA.size / 1024).toFixed(2)} KB</span>
              </div>
            )}
            <div className="mt-4">
              <textarea
                className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="文件内容预览..."
                value={contentA}
                onChange={(e) => setContentA(e.target.value)}
                readOnly={!!fileA}
              />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">B</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">新文件 (File B)</h2>
                <p className="text-sm text-gray-500">选择要比对的新文件</p>
              </div>
            </div>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600">点击或拖拽上传文件</p>
                <p className="text-xs text-gray-400 mt-1">支持 .txt, .md, .json, .csv, .js, .ts 等文本文件</p>
              </div>
              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'B')} />
            </label>
            {fileB && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700 font-medium">{fileB.name}</span>
                </div>
                <span className="text-sm text-green-600">{(fileB.size / 1024).toFixed(2)} KB</span>
              </div>
            )}
            <div className="mt-4">
              <textarea
                className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="文件内容预览..."
                value={contentB}
                onChange={(e) => setContentB(e.target.value)}
                readOnly={!!fileB}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={compareFiles}
            disabled={!contentA || !contentB || isComparing}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isComparing ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                比对中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                开始比对
              </>
            )}
          </button>
          {isStructuredFile && (
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              比对配置 {showConfig ? '▲' : '▼'}
            </button>
          )}
          <button onClick={clearAll} className="btn-secondary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            清空重置
          </button>
        </div>

        {showConfig && isStructuredFile && (
          <div className="card mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-xl font-semibold text-gray-800">比对配置</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">选择要比对的列（表头）</h3>
                <p className="text-xs text-gray-500 mb-3">系统已识别文件中的列，勾选参与比对的列：</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {detectedColumns.map(col => (
                    <label
                      key={col}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg cursor-pointer transition-all text-sm ${
                        selectedColumns.has(col)
                          ? 'bg-gradient-to-r from-primary to-secondary text-white border-transparent'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedColumns.has(col)}
                        onChange={() => toggleColumn(col)}
                      />
                      {col}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={selectAllCols} className="px-3 py-1 text-xs bg-gray-100 hover:bg-primary hover:text-white rounded border border-gray-200 transition-colors">全选</button>
                  <button onClick={deselectAllCols} className="px-3 py-1 text-xs bg-gray-100 hover:bg-primary hover:text-white rounded border border-gray-200 transition-colors">清空</button>
                </div>
                <div className="mt-3 p-2.5 bg-gray-50 rounded text-sm text-gray-600">
                  <strong className="text-gray-800">已选:</strong>{' '}
                  {selectedColumns.size === 0 ? (
                    <span className="text-red-600">未选择任何列</span>
                  ) : (
                    <span>共 {selectedColumns.size} 列</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">差异类型</h3>
                <p className="text-xs text-gray-500 mb-3">选择需要识别和显示的差异类型：</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'added', label: '新增', color: 'green' },
                    { key: 'removed', label: '删除', color: 'red' },
                    { key: 'modified', label: '修改', color: 'yellow' },
                    { key: 'same', label: '相同', color: 'blue' }
                  ].map(item => (
                    <label
                      key={item.key}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg cursor-pointer transition-all text-sm ${
                        enabledDiffTypes.has(item.key)
                          ? item.color === 'green' ? 'bg-green-600 text-white border-transparent'
                          : item.color === 'red' ? 'bg-red-600 text-white border-transparent'
                          : item.color === 'yellow' ? 'bg-yellow-600 text-white border-transparent'
                          : 'bg-blue-600 text-white border-transparent'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={enabledDiffTypes.has(item.key)}
                        onChange={() => toggleDiffType(item.key)}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">预览与导出设置</h3>
                <label
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg cursor-pointer transition-all text-sm ${
                    keepHeaders
                      ? 'bg-blue-600 text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={keepHeaders}
                    onChange={(e) => setKeepHeaders(e.target.checked)}
                  />
                  <span>保留列名（表头）</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">勾选后，预览和导出时将保留选中列的表头信息，便于数据对应</p>
              </div>
            </div>
          </div>
        )}

        {summary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">比对摘要</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="stat-card">
                <div className="text-3xl font-bold text-gray-800">{summary.totalLines}</div>
                <div className="text-sm text-gray-500">总行数</div>
              </div>
              <div className="stat-card bg-green-50 border-green-200">
                <div className="text-3xl font-bold text-green-600">{summary.addedLines}</div>
                <div className="text-sm text-green-600">新增行数</div>
              </div>
              <div className="stat-card bg-red-50 border-red-200">
                <div className="text-3xl font-bold text-red-600">{summary.removedLines}</div>
                <div className="text-sm text-red-600">删除行数</div>
              </div>
              <div className="stat-card bg-yellow-50 border-yellow-200">
                <div className="text-3xl font-bold text-yellow-600">{summary.modifiedLines}</div>
                <div className="text-sm text-yellow-600">修改行数</div>
              </div>
              <div className="stat-card bg-blue-50 border-blue-200">
                <div className="text-3xl font-bold text-blue-600">{summary.sameLines}</div>
                <div className="text-sm text-blue-600">相同行数</div>
              </div>
            </div>
          </div>
        )}

        {diffResults.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">差异详情</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">筛选:</span>
                <button
                  onClick={() => setCurrentFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    currentFilter === 'all'
                      ? 'bg-gradient-to-r from-primary to-secondary text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                  }`}
                >
                  全部 <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-black/10">{diffResults.length}</span>
                </button>
                <button
                  onClick={() => setCurrentFilter('added')}
                  disabled={!enabledDiffTypes.has('added')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    currentFilter === 'added'
                      ? 'bg-green-600 text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-500'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  新增 <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${currentFilter === 'added' ? 'bg-white/20' : 'bg-black/10'}`}>{summary?.addedLines || 0}</span>
                </button>
                <button
                  onClick={() => setCurrentFilter('removed')}
                  disabled={!enabledDiffTypes.has('removed')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    currentFilter === 'removed'
                      ? 'bg-red-600 text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-red-500'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  删除 <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${currentFilter === 'removed' ? 'bg-white/20' : 'bg-black/10'}`}>{summary?.removedLines || 0}</span>
                </button>
                <button
                  onClick={() => setCurrentFilter('modified')}
                  disabled={!enabledDiffTypes.has('modified')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    currentFilter === 'modified'
                      ? 'bg-yellow-600 text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-500'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  修改 <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${currentFilter === 'modified' ? 'bg-white/20' : 'bg-black/10'}`}>{summary?.modifiedLines || 0}</span>
                </button>
                <button
                  onClick={() => setCurrentFilter('same')}
                  disabled={!enabledDiffTypes.has('same')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    currentFilter === 'same'
                      ? 'bg-blue-600 text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-500'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  相同 <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${currentFilter === 'same' ? 'bg-white/20' : 'bg-black/10'}`}>{summary?.sameLines || 0}</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500 font-medium whitespace-nowrap">导出格式:</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                  <option value="txt">纯文本</option>
                </select>
                <button
                  onClick={() => exportData(exportFormat)}
                  className="btn-primary flex items-center gap-2 text-sm px-4 py-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  导出
                </button>
              </div>
            </div>
            <div className="card overflow-x-auto">
              {getFilteredResults().length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <div className="text-5xl mb-4">📭</div>
                  <p>当前筛选条件下没有差异内容</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">类型</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">原文件行号</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">新文件行号</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">原内容</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">新内容</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredResults().map((result, index) => (
                      <tr key={index} className={`border-b border-gray-100 ${
                        result.type === 'added' ? 'bg-green-50' :
                        result.type === 'removed' ? 'bg-red-50' :
                        result.type === 'modified' ? 'bg-yellow-50' :
                        'bg-white'
                      }`}>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            result.type === 'added' ? 'bg-green-200 text-green-800' :
                            result.type === 'removed' ? 'bg-red-200 text-red-800' :
                            result.type === 'modified' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {result.type === 'added' ? '新增' :
                             result.type === 'removed' ? '删除' :
                             result.type === 'modified' ? '修改' : '相同'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-600">{result.oldLineNumber || '-'}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{result.newLineNumber || '-'}</td>
                        <td className="px-4 py-3 font-mono text-gray-700 max-w-xs truncate" title={result.oldLine}>
                          {result.oldLine || '-'}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-700 max-w-xs truncate" title={result.newLine}>
                          {result.newLine || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {diffResults.length > 0 && summary && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">差异总结</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">比对概览</h3>
                <p className="text-gray-600">
                  已完成文件 <span className="font-mono text-blue-600">{fileA?.name || 'File A'}</span> 与 
                  <span className="font-mono text-green-600"> {fileB?.name || 'File B'}</span> 的比对。
                  两个文件共有 <span className="font-bold">{summary.totalLines}</span> 行内容。
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">新增内容</h3>
                  <p className="text-green-700">
                    新文件比原文件新增了 <span className="font-bold">{summary.addedLines}</span> 行内容，
                    占总内容的 <span className="font-bold">{((summary.addedLines / summary.totalLines) * 100).toFixed(1)}%</span>。
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">删除内容</h3>
                  <p className="text-red-700">
                    原文件中有 <span className="font-bold">{summary.removedLines}</span> 行内容在新文件中被删除，
                    占总内容的 <span className="font-bold">{((summary.removedLines / summary.totalLines) * 100).toFixed(1)}%</span>。
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">修改内容</h3>
                  <p className="text-yellow-700">
                    有 <span className="font-bold">{summary.modifiedLines}</span> 行内容发生了修改，
                    占总内容的 <span className="font-bold">{((summary.modifiedLines / summary.totalLines) * 100).toFixed(1)}%</span>。
                  </p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">内容一致性</h3>
                <p className="text-blue-700">
                  两个文件保持一致的内容有 <span className="font-bold">{summary.sameLines}</span> 行，
                  内容一致性为 <span className="font-bold">{((summary.sameLines / summary.totalLines) * 100).toFixed(1)}%</span>。
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>文件比对平台 - 快速、准确地发现文件差异</p>
        </div>
      </div>
    </div>
  )
}

export default FileDiff