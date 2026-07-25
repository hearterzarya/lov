function generateLicenseKey(): string {
  const segments = []
  for (let i = 0; i < 4; i++) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let segment = ''
    for (let j = 0; j < 4; j++) {
      segment += chars[Math.floor(Math.random() * chars.length)]
    }
    segments.push(segment)
  }
  return 'EB-' + segments.join('-')
}

export { generateLicenseKey }
