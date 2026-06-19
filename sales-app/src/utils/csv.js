function escapeCsvField(value) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function downloadCsv(filename, headers, rows) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvField).join(','))
  const csvContent = '﻿' + lines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function parseCsvLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields
}

export function parseCsvNames(text) {
  return text
    .split(/\r?\n/)
    .map((line) => parseCsvLine(line)[0]?.trim() ?? '')
    .filter((name) => name.length > 0 && name !== '名前' && name !== 'name')
}

export function parseCsvByColumn(text, headerCandidates) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return []

  const header = parseCsvLine(lines[0]).map((h) => h.trim())
  const colIndex = header.findIndex((h) => headerCandidates.includes(h))

  if (colIndex === -1) {
    return lines.map((line) => parseCsvLine(line)[0]?.trim() ?? '').filter((name) => name.length > 0)
  }

  return lines
    .slice(1)
    .map((line) => parseCsvLine(line)[colIndex]?.trim() ?? '')
    .filter((name) => name.length > 0)
}
