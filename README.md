# Check Unuse File

## Description
This extension helps you check and generate a list of trash files in a specified folder.

## Usage
1. Install this extention ^^
2. Press `Ctrl + P` to open the command palette.
3. Enter `>Check Unuse File` and enter.
2. Choose the desired workspace if you have multiple workspaces open. This step ensures that the extension operates within the correct workspace. If you have only one workspace => skip this step
3. In the input field of the command palette, enter the folder path you want to check for trash files. The folder path should be relative to the workspace root or an absolute path.
4. Enter the root path of your project. This step helps the extension determine the relative paths of the trash files found.
    - The root path should be the common parent directory of the specified folder and the files in your project. It ensures that the generated paths in the list are relative and accurate.
5. Wait for the checking process to complete. The extension will scan the specified folder and its subdirectories to identify trash files based on the specified file types (.png, .jpg, .jpeg, .gif, .svg, .ico).
    - During the process, you will see a progress indicator to track the scanning progress.
6. Once the checking process is complete, the extension will generate a file called `trash_file.txt`. This file will be placed in the specified folder.
    - `trash_file.txt` contains a list of the trash files found in the specified folder and its subdirectories.
    - Each file path is relative to the specified folder, making it easier to locate and manage the trash files.
7. You can now check the generated `trash_file.txt` in the specified folder. It provides you with a comprehensive list of trash files to help you manage and remove them from your project.

Please note that this extension operates only on the specified file types (.png, .jpg, .jpeg, .gif, .svg, .ico) within the specified folder and its subdirectories. Any files that match the specified file types and are no longer used or required in your project are considered trash files.

If you encounter any issues or have suggestions, please feel free to provide feedback or report them on the extension's [GitHub repository](https://github.com/nguyenvinhtieng/get_a_basic_app_vscode_extension). Your feedback helps us improve the extension and provide a better experience for all users.
