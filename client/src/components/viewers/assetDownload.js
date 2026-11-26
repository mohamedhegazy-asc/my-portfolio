export async function triggerAssetDownload(asset) {
  const id = asset?.id || asset?._id
  let url = asset?.url
  if (id) {
    try {
      const res = await fetch(`/api/assets/${id}/download`, { method: 'POST' })
      if (res.ok) {
        const json = await res.json()
        if (json?.data?.url) url = json.data.url
      }
    } catch {}
  }
  if (url) {
    const a = document.createElement('a')
    a.href = url
    a.download = asset?.originalName || asset?.title || 'file'
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

export function formatBytes(bytes = 0) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}
