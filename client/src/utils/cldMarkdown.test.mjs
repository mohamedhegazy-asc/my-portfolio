import test from 'node:test'
import assert from 'node:assert/strict'
import {
  safeMarkdownUrlTransform,
  parseCldImageUrl,
  formatCldImageUrl,
  extractInlineImageGroups
} from './cldMarkdown.js'

test('safeMarkdownUrlTransform allows cld:, https:, http:, relative /, and blocks unsafe schemes', () => {
  assert.equal(
    safeMarkdownUrlTransform('cld:portfolio/inline/chart1#ar=16:9&w=75&align=center'),
    'cld:portfolio/inline/chart1#ar=16:9&w=75&align=center'
  )
  assert.equal(safeMarkdownUrlTransform('https://example.com/a.png'), 'https://example.com/a.png')
  assert.equal(safeMarkdownUrlTransform('/assets/img.png'), '/assets/img.png')

  assert.equal(safeMarkdownUrlTransform('javascript:alert(1)'), '')
  assert.equal(safeMarkdownUrlTransform('data:text/html,<script>alert(1)</script>'), '')
  assert.equal(safeMarkdownUrlTransform('vbscript:msgbox(1)'), '')
  assert.equal(safeMarkdownUrlTransform('cld:../etc/passwd'), '')
})

test('parseCldImageUrl validates width (50, 75, 100), alignment (center, start, end), and aspect ratio', () => {
  const parsed = parseCldImageUrl('cld:portfolio/inline/kpi#ar=4:3&w=75&align=start')
  assert.deepEqual(parsed, {
    publicId: 'portfolio/inline/kpi',
    widthPct: 75,
    align: 'start',
    aspectRatio: '4 / 3'
  })

  // Invalid width/align fall back to safe defaults (100, center, 16 / 9)
  const fallback = parseCldImageUrl('cld:portfolio/inline/kpi#ar=evil&w=999&align=top')
  assert.deepEqual(fallback, {
    publicId: 'portfolio/inline/kpi',
    widthPct: 100,
    align: 'center',
    aspectRatio: '16 / 9'
  })

  assert.equal(parseCldImageUrl('cld:bad..path'), null)
  assert.equal(formatCldImageUrl('portfolio/inline/x', { ar: '16:9', w: 50, align: 'end' }), 'cld:portfolio/inline/x#ar=16:9&w=50&align=end')
})

test('extractInlineImageGroups groups consecutive images and separates non-consecutive ones', () => {
  const md = [
    '![First](cld:portfolio/inline/1#ar=16:9&w=100&align=center "Cap 1")',
    '',
    '![Second](cld:portfolio/inline/2#ar=16:9&w=75&align=start "Cap 2")',
    '',
    'Some text paragraph.',
    '',
    '![Third](https://example.com/3.png)'
  ].join('\n')

  const groups = extractInlineImageGroups(md)
  assert.equal(groups.length, 2)
  assert.equal(groups[0].length, 2)
  assert.equal(groups[0][0].publicId, 'portfolio/inline/1')
  assert.equal(groups[0][1].publicId, 'portfolio/inline/2')
  assert.equal(groups[1].length, 1)
  assert.equal(groups[1][0].src, 'https://example.com/3.png')
})
