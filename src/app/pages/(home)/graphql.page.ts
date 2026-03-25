import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphqlComponent } from '../../features/graphql/graphql.component';

@Component({
  selector: 'reqquest-graphql-page',
  standalone: true,
  imports: [CommonModule, GraphqlComponent],
  template: `<app-graphql-feature class="block h-full" />`,
  host: {
    class: 'block h-full min-h-0'
  }
})
export default class GraphQLPage {}
