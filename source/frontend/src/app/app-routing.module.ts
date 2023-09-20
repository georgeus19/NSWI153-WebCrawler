import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebsiteRecordsPageComponent } from './website-records-page/website-records-page.component';
import { ExecutionsPageComponent } from './executions-page/executions-page.component';

export class RoutePaths {
    static readonly WEBSITE_RECORDS_PAGE_COMPONENT_PATH: string = 'website-records';
    static readonly EXECUTIONS_PAGE_COMPONENT_PATH: string = 'executions';
}

const routes: Routes = [
    { path: RoutePaths.WEBSITE_RECORDS_PAGE_COMPONENT_PATH, component: WebsiteRecordsPageComponent },
    { path: RoutePaths.EXECUTIONS_PAGE_COMPONENT_PATH, component: ExecutionsPageComponent },
    { path: '**', component: WebsiteRecordsPageComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
