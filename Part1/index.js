const fs = require("node:fs");
const path = require("node:path");
const EventEmitter = require("node:events");
const emitter = new EventEmitter();
const os = require("node:os");

console.log("---------------------1-----------------------");

function logFilePathAndDir() {
  console.log({
    File: __filename,
    Dir: __dirname,
  });
}

logFilePathAndDir();

console.log("---------------------2-----------------------");

function getFileName(filePath) {
  return path.basename(filePath);
}
console.log(getFileName("/user/files/report.pdf"));

console.log("---------------------3-----------------------");

function buildPath(pathObj) {
  return path.format(pathObj);
}
console.log(buildPath({ dir: "/folder", name: "app", ext: ".js" }));

console.log("---------------------4-----------------------");

function getFileExtension(filePath) {
  return path.extname(filePath);
}

console.log(getFileExtension("/docs/readme.md"));

console.log("---------------------5-----------------------");

function parsePath(filePath) {
  const parsed = path.parse(filePath);
  return {
    Name: parsed.name,
    Ext: parsed.ext,
  };
}

console.log(parsePath("/home/app/main.js"));

console.log("---------------------6-----------------------");

function isAbsolutePath(filePath) {
  return path.isAbsolute(filePath);
}

console.log(isAbsolutePath("/home/user/file.txt"));

console.log(isAbsolutePath("relative/file.txt"));

console.log("---------------------7-----------------------");

function joinPaths(...dirc) {
  return path.join(...dirc);
}

console.log(joinPaths("src", "components", "App.js"));

console.log("---------------------8-----------------------");

function resolvePath(resolvePath) {
  return path.resolve(resolvePath);
}

console.log(resolvePath("./index.js"));

console.log("---------------------9-----------------------");

function joinTwoPaths(path1, path2) {
  return path.join(path1, path2);
}
console.log(joinTwoPaths("/folder1", "folder2/file.text"));

console.log("---------------------10-----------------------");

function deleteFileAsync(filePath) {
  try {
    fs.rmSync(filePath);
    console.log(`The ${path.basename(filePath)} is deleted.`);
  } catch (err) {
    console.error(`Error deleting file: ${err.message}`);
  }
}

deleteFileAsync("/path/to/file.txt");

// const filePath = path.join(__dirname, "path", "to", "file.txt");
// deleteFileAsync(filePath);

console.log("---------------------11-----------------------");

function createFolderSync(folderPath) {
  try {
    fs.mkdirSync(folderPath);
    console.log("Success");
  } catch (err) {
    console.error(`Error creating folder: ${err.message}`);
  }
}

createFolderSync("./createdFile");

console.log("---------------------12-----------------------");

emitter.on("start", () => {
  console.log("Welcome event triggered!");
});

emitter.emit("start");

console.log("---------------------13-----------------------");

emitter.on("login", (username) => {
  console.log(`User logged in: ${username}`);
});
emitter.emit("login", "Ahmed");

console.log("---------------------14-----------------------");

function readFileSync(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    console.log(content);
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
  }
}
readFileSync("./notes.txt");

console.log("---------------------15-----------------------");

const fsp = require("node:fs/promises");

async function writeFileAsync(filePath, content) {
  try {
    await fsp.writeFile(filePath, content);
    console.log("File written successfully");
  } catch (err) {
    console.error(`Error writing file: ${err.message}`);
  }
}
writeFileAsync("./async.txt", "Async save");

console.log("---------------------16-----------------------");

function checkExists(pathToCheck) {
  return fs.existsSync(pathToCheck);
}

console.log(checkExists("./notes.txt"));

console.log(checkExists("./doesNotExist.txt"));

console.log("---------------------17-----------------------");

function getPlatformInfo() {
  return {
    Platform: os.platform(),
    Arch: os.arch(),
  };
}

console.log(getPlatformInfo());

console.log("---------------------async 18-----------------------");

function readFileInChunks(filePath) {
  const readStream = fs.createReadStream(filePath, {
    encoding: "utf-8",
    // highWaterMark:16
  });

  readStream.on("data", (chunk) => {
    console.log("Chunk:", chunk);
  });

  readStream.on("end", () => {
    console.log("log each chunk");
  });

  readStream.on("error", (err) => {
    console.error("Error reading file:", err.message);
  });
}
readFileInChunks("./big.txt");

console.log("---------------------async 19-----------------------");


function copyFileWithStreams(sourcePath, destPath) {
    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(destPath);

  readStream.pipe(writeStream);

  writeStream.on('finish', () => {
    console.log('File copied using streams');
  });

  readStream.on('error', (err) => {
    console.error('Error reading file:', err.message);
  });

  writeStream.on('error', (err) => {
    console.error('Error writing file:', err.message);
  });
}
copyFileWithStreams('./source.txt', './dest.txt');


console.log("---------------------async 20-----------------------");
const zlib = require('node:zlib');
const { pipeline } = require('node:stream');

function compressFile(inputPath, outputPath) {
  const readStream = fs.createReadStream(inputPath);
  const gzip = zlib.createGzip();
  const writeStream = fs.createWriteStream(outputPath);

  pipeline(readStream, gzip, writeStream, (err) => {
    if (err) {
      console.error('Pipeline failed:', err.message);
    } else {
      console.log('File compressed successfully');
    }
  });
}

compressFile('./data.txt', './data.txt.gz');



