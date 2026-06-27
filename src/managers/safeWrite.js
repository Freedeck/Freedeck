const { writeFile, rename, unlink, mkdir } = require('fs/promises')
const {dirname,join} = require('path');
const {randomBytes} = require('crypto')

async function safeWriteAsync(filepath, content) {
  const dir = dirname(filepath);
  await mkdir(dir, { recursive: true });

  const tempFilename = `.${randomBytes(6).toString('hex')}.tmp`;
  const tempPath = join(dir, tempFilename);

  try {
    await writeFile(tempPath, content, 'utf8');

    await rename(tempPath, filepath);
  } catch (error) {
    try {
      await unlink(tempPath);
    } catch {
    }
    throw error;
  }
}
module.exports = {safeWriteAsync}