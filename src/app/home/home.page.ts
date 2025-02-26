import { Component } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  fileName: string = '';
  fileContent: string = '';
  fileList: string[] = [];
  constructor(private router: Router, private route:ActivatedRoute) {}


  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['file']) {
        this.fileName = decodeURIComponent(params['file']); // Decode the filename
        this.readFile();
      }
    }); 
  }
  

  async createFile() {
    try {
      await Filesystem.writeFile({
        path: this.fileName,
        data: this.fileContent,
        directory: Directory.Documents
      });
    } catch (error) {
      console.error('Error creating file', error)
    }
  }

  async deleteFile() {
    try {
      await Filesystem.deleteFile({
        path: this.fileName,
        directory: Directory.Documents
      });
      alert('File deleted successfully!');
      this.refreshFileList();
    } catch (error) {
      console.error('Error deleting file', error);
    }
  }

  async refreshFileList(){
    try {
      const result = await Filesystem.readdir({
        path: '',
        directory: Directory.Documents,
      });''
      this.fileList = result.files.map(file => file.name);
    } catch (error) {
      console.error('Error reading directory', error);
    }
  }

  goToFileListPage() {
    this.router.navigate(['/file-list-page']);
  }

  async listFiles() {
    try {
      const result = await Filesystem.readdir({
        path: '', // Root of the directory
        directory: Directory.Documents, // Use Documents, Data, or other predefined directories
      });

      this.fileList = result.files.map(file => file.name);
      console.log('Files:', this.fileList);
    } catch (error) {
      console.error('Error reading directory', error);
    }
  }

  async loadFile() {
    try {
      const contents = await Filesystem.readFile({
        path: this.fileName,
        directory: Directory.Documents,
      });

      this.fileContent = contents.data.toString();;
    } catch (error) {
      console.error('Error reading file', error);
    }
  }

  async readFile() {
    try {
      const contents = await Filesystem.readFile({
        path: this.fileName,
        directory: Directory.Documents,
      });

      this.fileContent = contents.data.toString();
    } catch (error) {
      console.error('Error reading file', error);
    }
  }

  async saveFile() {
    try {
      await Filesystem.writeFile({
        path: this.fileName,
        data: this.fileContent,
        directory: Directory.Documents,
      });

      alert('File updated successfully!');
    } catch (error) {
      console.error('Error saving file', error);
    }
  }

  goBack() {
    this.router.navigate(['/file-list-page']);
  }

}
