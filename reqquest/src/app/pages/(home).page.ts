import { Component } from '@angular/core';

import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'reqquest-home',

  imports: [HeaderComponent],
  template: `
    <reqquest-header></reqquest-header>
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <h1>Home</h1>
        </div>
      </div>
    </div>
  `,
})
export default class HomeComponent {}
