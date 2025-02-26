import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FileListPage } from './file-list-page.page';

const routes: Routes = [
  {
    path: '',
    component: FileListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FileListPagePageRoutingModule {}
