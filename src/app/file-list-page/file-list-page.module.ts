import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FileListPagePageRoutingModule } from './file-list-page-routing.module';
import { FileListPage } from './file-list-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FileListPagePageRoutingModule
  ],
  declarations: [FileListPage]
})
export class FileListPagePageModule {}
