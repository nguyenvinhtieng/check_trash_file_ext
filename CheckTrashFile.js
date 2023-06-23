const vscode = require('vscode');
const fs = require('fs');
const path = require('path');


export default class CheckTrashFile {
  constructor(root_folder, current_folder) {
    this.ROOT_FOLDER = root_folder;
    this.CURRENT_FOLDER = current_folder;
    this.IGNORE_FOLDERS = ['node_modules', '.git', '.vscode', 'dist', 'build'];
    this.IGNORE_FILES = ['package-lock.json', 'package.json', 'README.md', 'yarn.lock', '.gitignore', '.env'];
    this.IMAGES_FILE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];
    this.JS_FILE_EXTENSIONS = ['.js', '.jsx', '.tsx', '.ts'];
    this.CSS_FILE_EXTENSIONS = ['.css', '.scss', '.sass'];
    this.checking_files = [];
    this.asset_files = [];
    this.trash_files = [];
    this.used_files = [];

    this.readDirectory(this.CURRENT_FOLDER);
    this.checkUsedFile();
    this.checkTrashFile();
    this.writeFile();
  }

  logArray(array) {
    array.forEach((item, index) => {
      console.log(index, item);
    })
  }

  resolveRelativePath(filePath, currentDir) {
    if (filePath.startsWith('/')) {
      filePath = "." + filePath;
      currentDir = this.ROOT_FOLDER;
    }else if(!filePath.startsWith('/') && !filePath.startsWith('.')) {
      filePath = "./" + filePath;
    }

    const resolvedPath = path.resolve(currentDir, filePath);
    return resolvedPath;
  }

  resolveArrayRelativePath(array, currentDir) {
    const resolvedPath = array.map(item => {
      return this.resolveRelativePath(item, currentDir);
    })
    return resolvedPath;
  }

  readDirectory(directory) {
    let self = this;
    fs.readdirSync(directory).forEach(file => {
      let file_relative_path = self.resolveRelativePath(file, directory);
      if (fs.statSync(file_relative_path).isDirectory()) {
        !self.IGNORE_FOLDERS.includes(file) && self.readDirectory(file_relative_path);
      }
      else {
        if (self.IGNORE_FILES.includes(file)) return;
        let extName = path.extname(file);
        if (self.IMAGES_FILE_EXTENSIONS.includes(extName)) {
          self.asset_files.push(file_relative_path);
          return;
        }
        if (self.JS_FILE_EXTENSIONS.includes(extName) || self.CSS_FILE_EXTENSIONS.includes(extName)) {
          self.asset_files.push(file_relative_path);
          self.checking_files.push(file_relative_path);
          return;
        }
        self.checking_files.push(file_relative_path);
      }
    });
  }


  extractImageLinksFromHTML(htmlContent) {
    // check end with asset file content like .jpg ,.js...... in all case ex: link, src, srcset ....
    const regex = /(?<=\(|,|\s|'|")([^'"\(\)]+\.(png|jpe?g|gif|svg|ico))(?=\)|,|\s|'|")/g;
    const matches = htmlContent.matchAll(regex);
    const imageLinks = Array.from(matches, match => match[1]);
    return imageLinks;
  }

  extractImageLinksFromCSS(cssContent) {
    const urlRegex = /url\(['"]?([^'"\(\)]+)['"]?\)/g;
    const matches  = cssContent.matchAll(urlRegex);
    const imageLinks = Array.from(matches, match => match[1]);
    return imageLinks;
  }
  
  extractImageLinksFromJs(fileContent) {
    const regex = /(?<=\(|,|\s|'|")([^'"\(\)]+\.(png|jpe?g|gif|svg|ico))(?=\)|,|\s|'|")/g;
    const matches = fileContent.matchAll(regex);
    const imageLinks = Array.from(matches, match => match[1]);
    return imageLinks;
  }


  checkUsedFile() {
    const arrayLength = this.checking_files.length;
    for(let i = 0; i < arrayLength; i++) {
      const file_content = fs.readFileSync(this.checking_files[i], 'utf8');
      const file_extention = this.checking_files[i].split('.').pop();
      switch (file_extention) {
        case 'php':
          break;
        case 'html': 
          const imageLinksHTML = this.extractImageLinksFromHTML(file_content);
          const allLinkHTML = this.resolveArrayRelativePath(imageLinksHTML, this.checking_files[i])
          this.used_files.push(...allLinkHTML)
          break;
        case 'css':
          let imageLinkCSS = this.extractImageLinksFromCSS(file_content);
          let allLinkCSS = this.resolveArrayRelativePath(imageLinkCSS, this.checking_files[i])
          this.used_files.push(...allLinkCSS)
          break;
        case 'js':
          let imageLinksJS = this.extractImageLinksFromJs(file_content);
          let allLinkJS = this.resolveArrayRelativePath(imageLinksJS, this.checking_files[i])
          this.used_files.push(...allLinkJS)
          break;
        default: 
          // console.log('default')
          break;
      }
    }
  }

  checkTrashFile() {
    let asset_files_length = this.asset_files.length;
    for(let i = 0; i < asset_files_length; i++) {
      if(!this.used_files.includes(this.asset_files[i])) {
        this.trash_files.push(this.asset_files[i])
      }
    }
  }


  writeFile() {
    // vscode.window.showInputBox({
    //   placeHolder: 'Input file name save',
    //   prompt: 'Input file name save',
    //   value: "trash_file.txt"
    // }, (value) => {
    //   fs.writeFile(value,this.trash_files.join('\r\n'), function (err) {
    //     if (err) throw err;
    //   })
    // });

    fs.writeFile("./trash_file.txt",this.trash_files.join('\r\n'), function (err) {
      if (err) throw err;
    })
  }


}