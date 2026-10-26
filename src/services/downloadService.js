export function downloadText(content, filename, mimeType = 'text/plain;charset=utf-8') {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return false
  let url = null
  let anchor = null
  try {
    const blob = new Blob([content], { type: mimeType })
    url = URL.createObjectURL(blob)
    anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    return true
  } catch {
    return false
  } finally {
    anchor?.remove()
    if (url) URL.revokeObjectURL(url)
  }
}

export function localTimestampForFilename(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`
}
