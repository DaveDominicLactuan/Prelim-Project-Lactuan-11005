import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Component({
  selector: 'app-file-list-page',
  templateUrl: './file-list-page.page.html',
  standalone: false,
  styleUrls: ['./file-list-page.page.scss'],
})
export class FileListPage {
  fileList: string[] = [];
  fileCount: number = 0;
  expandedFile: string | null = null; // Store which file is expanded
  fileContentMap: { [key: string]: string } = {}; // Store file contents

  constructor(private router: Router) {
    this.listFiles();
  }


  toggleExpand(file: string) {
    this.expandedFile = this.expandedFile === file ? null : file;
  }

  async readFile(fileName: string) {
    try {
      const contents = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Documents,
      });

      this.fileContentMap[fileName] = contents.data.toString();
      this.expandedFile = fileName; // Expand card when reading
    } catch (error) {
      console.error('Error reading file', error);
    }
  }

  async listFiles() {
    try {
      const result = await Filesystem.readdir({
        path: '',
        directory: Directory.Documents,
      });

      this.fileList = result.files.map(file => file.name);
      this.fileCount = this.fileList.length;
    } catch (error) {
      console.error('Error reading directory', error);
    }
  }

  goToHome(fileName: string) {
    this.router.navigateByUrl(`/home?file=${encodeURIComponent(fileName)}`);
  }
  

  async deleteFile(fileName: string) {
    try {
      await Filesystem.deleteFile({
        path: fileName,
        directory: Directory.Documents,
      });

      alert(`File ${fileName} deleted successfully!`);
      this.listFiles(); // Refresh file list
    } catch (error) {
      console.error('Error deleting file', error);
    }
  }

  goToHome2() {
    this.router.navigate(['/']);
  }
  
}
