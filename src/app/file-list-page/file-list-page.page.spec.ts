import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileListPage } from './file-list-page.page';

describe('FileListPagePage', () => {
  let component: FileListPage;
  let fixture: ComponentFixture<FileListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FileListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
