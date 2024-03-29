import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WebsiteRecordsPageComponent } from './website-records-page/website-records-page.component';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { WebsiteRecordsPageFilterDialogComponent } from './website-records-page-filter-dialog/website-records-page-filter-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { WebsiteRecordsPageSortDialogComponent } from './website-records-page-sort-dialog/website-records-page-sort-dialog.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { WebsiteRecordCardComponent } from './website-record-card/website-record-card.component';
import { WebsiteRecordEditComponent } from './website-record-edit/website-record-edit.component';
import { ExecutionsPageComponent } from './executions-page/executions-page.component';
import { MatTableModule } from '@angular/material/table';
import { ExecutionsTableComponent } from './executions-table/executions-table.component';
import { WebsiteRecordDetailComponent } from './website-record-detail/website-record-detail.component';
import { MatSortModule } from '@angular/material/sort';
import { WebsiteGraphComponent } from './website-graph/website-graph.component';
import { NodeDetailDialogComponent } from './node-detail-dialog/node-detail-dialog.component';

@NgModule({
    declarations: [
        AppComponent,
        WebsiteRecordsPageComponent,
        HeaderComponent,
        WebsiteRecordsPageFilterDialogComponent,
        WebsiteRecordsPageSortDialogComponent,
        WebsiteRecordCardComponent,
        WebsiteRecordEditComponent,
        ExecutionsPageComponent,
        ExecutionsTableComponent,
        WebsiteRecordDetailComponent,
        WebsiteGraphComponent,
        NodeDetailDialogComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatDividerModule,
        MatButtonModule,
        MatCardModule,
        MatRadioModule,
        MatPaginatorModule,
        MatSelectModule,
        MatDialogModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonToggleModule,
        MatSlideToggleModule,
        MatTableModule,
        MatSortModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
