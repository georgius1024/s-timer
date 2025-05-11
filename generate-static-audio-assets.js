const fs = require('fs').promises
const path = require('path')

// Список треков
const tracks = [
  '1m',
  '10s',
  '2m',
  'fire',
  'start',
  'stop-fire-discharge',
  'charge',
  'prepare',
  'fill-up',
  'move-on',
  'rest',
  'safe-free',
  'start-ranging',
  'stop-ranging',
  'attention',
  'whistle'
]

// Папки и выходной файл
const oggDir = path.join(__dirname, 'src', 'assets', 'audio')
const mp3Dir = path.join(__dirname, 'src', 'assets', 'audio')
const outputJson = path.join(__dirname, 'src', 'audio_base64.json')

async function generateAudioBase64() {
  try {
    // Объект для хранения base64-данных
    const audioData = {}

    // Обрабатываем каждый трек
    for (const track of tracks) {
      console.log(`Processing track: ${track}`)

      // Проверяем наличие файлов
      const oggPath = path.join(oggDir, `${track}.ogg`)
      const mp3Path = path.join(mp3Dir, `${track}.mp3`)

      if (
        !(await fs
          .access(oggPath)
          .then(() => true)
          .catch(() => false))
      ) {
        console.warn(`Warning: ${oggPath} not found, skipping ogg for ${track}`)
      }
      if (
        !(await fs
          .access(mp3Path)
          .then(() => true)
          .catch(() => false))
      ) {
        console.warn(`Warning: ${mp3Path} not found, skipping mp3 for ${track}`)
      }

      // Читаем и конвертируем в base64
      audioData[track] = {}

      if (
        await fs
          .access(oggPath)
          .then(() => true)
          .catch(() => false)
      ) {
        const oggData = await fs.readFile(oggPath)
        audioData[track].ogg = `data:audio/ogg;base64,${oggData.toString('base64')}`
      }

      if (
        await fs
          .access(mp3Path)
          .then(() => true)
          .catch(() => false)
      ) {
        const mp3Data = await fs.readFile(mp3Path)
        audioData[track].mp3 = `data:audio/mpeg;base64,${mp3Data.toString('base64')}`
      }
    }

    // Сохраняем результат в JSON
    await fs.writeFile(outputJson, JSON.stringify(audioData, null, 2))
    console.log(`Generated ${outputJson}`)
  } catch (error) {
    console.error('Error generating audio base64:', error)
    process.exit(1)
  }
}

// Запускаем скрипт
generateAudioBase64()
