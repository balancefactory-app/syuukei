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

export function parseCsvNames(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^"|"$/g, '').trim())
    .filter((line) => line.length > 0 && line !== '名前' && line !== 'name')
}
