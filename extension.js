const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const FILE_NAME_SAVE = 'trash_file.txt';
/* --------------------------------------------------------------------------
							Check trash file class
--------------------------------------------------------------------------*/ 
class CheckTrashFile {
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
		this.file_checked = 0;
    this.readDirectory(this.CURRENT_FOLDER);
    
  }


	startChecking() {
		this.checkUsedFile();
    this.checkTrashFile();
	}

	readCheckingFile() {
		this.logArray(this.checking_files);
	}

	readAssetFile() {
		this.logArray(this.asset_files);
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
    const regex = /(?<=\(|,|\s|'|")([^'"\(\)]+\.(png|jpe?g|gif|svg|ico|css|js))(?=\)|,|\s|'|")/g;
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
			this.file_checked += 1;
      switch (file_extention) {
        case 'php':
          break;
        case 'html': 
          const imageLinksHTML = this.extractImageLinksFromHTML(file_content);
          const allLinkHTML = this.resolveArrayRelativePath(imageLinksHTML, path.dirname(this.checking_files[i]))
          this.used_files.push(...allLinkHTML)
          break;
        case 'css':
          let imageLinkCSS = this.extractImageLinksFromCSS(file_content);
          let allLinkCSS = this.resolveArrayRelativePath(imageLinkCSS, path.dirname(this.checking_files[i]))
          this.used_files.push(...allLinkCSS)
          break;
        case 'js':
          let imageLinksJS = this.extractImageLinksFromJs(file_content);
          let allLinkJS = this.resolveArrayRelativePath(imageLinksJS, path.dirname(this.checking_files[i]))
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

  writeFile(array_file_name = this.trash_files) {
    fs.writeFile(this.ROOT_FOLDER + FILE_NAME_SAVE , array_file_name.join('\r\n'), function (err) {
      if (err) throw err;
    })
  }


}



/* --------------------------------------------------------------------------
							Choose checking folder and root folder
--------------------------------------------------------------------------*/ 
async function chooseCheckingFolderAndRootFolder(folder) {
	// Choose checking folder
	let checkingFolder = await vscode.window.showInputBox({
		placeHolder: 'Input checking folder',
		prompt: 'Input checking folder',
		value: folder
	});
	if(!checkingFolder) {
		vscode.window.showErrorMessage('No checking folder is chosen !', {modal: true});
		return;
	}
	if(checkingFolder[0] === '/') {
		checkingFolder = checkingFolder.slice(1);
	}
	if(!fs.existsSync(checkingFolder)) {
		vscode.window.showErrorMessage('Checking folder not exist !', {modal: true});
		return;
	}

	// Choose root folder
	let rootFolder = await vscode.window.showInputBox({
		placeHolder: 'Input root folder',
		prompt: 'Input root folder',
		value: folder
	});
	if(!rootFolder) {
		vscode.window.showErrorMessage('No checking folder is chosen !', {modal: true});
		return;
	}
	if(rootFolder[0] === '/') {
		rootFolder = rootFolder.slice(1);
	}
	if(!fs.existsSync(rootFolder)) {
		vscode.window.showErrorMessage('Checking folder not exist !', {modal: true});
		return;
	}

	if(checkingFolder[checkingFolder.length - 1] !== '/') {
		checkingFolder += '/';
	}
	if(rootFolder[rootFolder.length - 1] !== '/') {
		rootFolder += '/';
	}

	
	vscode.window.withProgress({
    location: vscode.ProgressLocation.Window,
    cancellable: false,
    title: 'Checking trash file at ' + checkingFolder + ' ...'
	}, async (progress) => {
		progress.report({  increment: 0 });
		const checkTrashFile = new CheckTrashFile(checkingFolder, rootFolder);
		checkTrashFile.startChecking();
		checkTrashFile.writeFile();
		progress.report({ increment: 100 });
		vscode.window.showInformationMessage('Check trash file done ! Trash file list save at ./trash_file.txt', {modal: true});
	});
}

function activate(context) {
	console.log('Congratulations, your extension "check-unuse-file" is now active!');
	let disposable = vscode.commands.registerCommand('check-unuse-file.check_unuse_file', async function () {
		vscode.window.showInformationMessage('Hello World from check unuse file !');
		const workspaceFolders = vscode.workspace.workspaceFolders;
		let arrayWorkspaceFolders = [];

		if(!workspaceFolders) {
			vscode.window.showInformationMessage('No folder in workspace !', {modal: true});
			return;
		}

		workspaceFolders.forEach((workspaceFolder) => {
			arrayWorkspaceFolders.push(workspaceFolder.uri.path);
		});

		if(arrayWorkspaceFolders.length === 1) {
			vscode.window.showInformationMessage('Only one folder in workspace !');
			await chooseCheckingFolderAndRootFolder(arrayWorkspaceFolders[0])
			return;
		}

		if(arrayWorkspaceFolders.length > 1) {
			vscode.window.showQuickPick(arrayWorkspaceFolders).then(async (folder) => {
				if(!folder) {
					vscode.window.showErrorMessage('No folder is chosen !', {modal: true});
					return;
				}
				await chooseCheckingFolderAndRootFolder(folder)
			});
		}
		
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
