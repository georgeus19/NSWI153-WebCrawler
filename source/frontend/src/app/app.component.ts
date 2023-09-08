import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    title = 'xx';
    x = { nothing: true };

    ngOnInit(): void {
        fetch('/website-records')
            .then((r) => r.json())
            .then((data) => {
                this.x = data;

                console.log(this.x);
            });
    }
}
