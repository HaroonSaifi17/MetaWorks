import { Component, OnInit, Output, signal,EventEmitter } from '@angular/core';

@Component({
  selector: 'reqquest-rest-panel',
  standalone: true,
  imports: [],
  templateUrl: './rest-panel.component.html',
  styleUrl: './rest-panel.component.css'
})
export class RestPanelComponent implements OnInit {
  @Output() requestMethodEvent =  new EventEmitter<string>();
  count = signal(0);
  ngOnInit() {
    this.requestMethodEvent.emit('POST');
  }
}
