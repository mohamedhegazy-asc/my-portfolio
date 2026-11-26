import test from 'node:test'
import assert from 'node:assert/strict'
import {
  SUPPORTED_WIDTHS,
  snapWidth,
  cldUrl,
  buildCloudinarySrcSet
} from './cloudinary.js'

test('snapWidth only produces supported widths [320, 480, 640, 800, 1024, 1280, 1600]', () => {
  assert.deepEqual(SUPPORTED_WIDTHS, [320, 480, 640, 800, 1024, 1280, 1600])
  assert.equal(snapWidth(100), 320)
  assert.equal(snapWidth(360), 480)
  assert.equal(snapWidth(750), 800)
  assert.equal(snapWidth(1200), 1280)
  assert.equal(snapWidth(2400), 1600)
})

test('cldUrl builds pure transformation presets for card, cover, inline, and lqip', () => {
  const card = cldUrl('portfolio/thumbnail/p1', { cloudName: 'demo', preset: 'card', width: 640 })
  assert.equal(card, 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,g_auto,ar_16:9,w_640/portfolio/thumbnail/p1')

  const cover = cldUrl('portfolio/thumbnail/a1', { cloudName: 'demo', preset: 'cover', width: 1200 })
  assert.equal(cover, 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,g_auto,ar_16:9,w_1280/portfolio/thumbnail/a1')

  const inline = cldUrl('portfolio/inline/c1', { cloudName: 'demo', preset: 'inline', width: 800 })
  assert.equal(inline, 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_800/portfolio/inline/c1')

  const lqip = cldUrl('portfolio/inline/c1', { cloudName: 'demo', preset: 'lqip' })
  assert.equal(lqip, 'https://res.cloudinary.com/demo/image/upload/w_48,c_limit,e_blur:800,q_auto:eco,f_auto/portfolio/inline/c1')
})

test('buildCloudinarySrcSet emits all 7 supported widths', () => {
  const srcset = buildCloudinarySrcSet('portfolio/gallery/g1', 'inline', 'demo')
  for (const w of SUPPORTED_WIDTHS) {
    assert.ok(srcset.includes(`w_${w}/portfolio/gallery/g1 ${w}w`))
  }
})
