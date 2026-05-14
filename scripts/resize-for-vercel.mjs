#!/usr/bin/env node
import sharp from 'sharp'
import { readdir } from 'fs/promises'
import { join, basename } from 'path'

const TARGET_WIDTH = 1920
const TARGET_HEIGHT = 1080

async function resizeImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 90 })
      .toFile(outputPath)

    console.log(`✅ Resized: ${basename(inputPath)} -> ${basename(outputPath)}`)
  } catch (error) {
    console.error(`❌ Failed to resize ${inputPath}:`, error.message)
  }
}

async function main() {
  console.log('🖼️  Resizing images to 1920x1080 (16:9) for Vercel integration...\n')

  // Create output directory
  const outputDir = './public/images/vercel-integration'
  await import('fs/promises').then(fs => fs.mkdir(outputDir, { recursive: true }))

  // Resize og-image.png
  await resizeImage(
    './public/og-image.png',
    join(outputDir, 'featured-1-og-image.png')
  )

  // Resize site samples
  const samplesDir = './public/images/site-samples'
  const files = await readdir(samplesDir)

  let count = 2
  for (const file of files) {
    if (file.endsWith('.webp') || file.endsWith('.png') || file.endsWith('.jpg')) {
      await resizeImage(
        join(samplesDir, file),
        join(outputDir, `featured-${count}-${file.replace('.webp', '.png')}`)
      )
      count++
    }
  }

  console.log(`\n✨ Done! Images saved to: ${outputDir}`)
  console.log(`📋 Upload these images to your Vercel integration form.`)
}

main().catch(console.error)
