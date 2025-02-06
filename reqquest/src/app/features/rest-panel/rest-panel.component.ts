import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import RequestMethod from '../../utils/method.type';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/ui-select-helm';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'reqquest-rest-panel',
  standalone: true,
  imports: [BrnSelectImports, HlmSelectImports, CommonModule, FormsModule],
  templateUrl: './rest-panel.component.html',
  styleUrl: './rest-panel.component.css',
})
export class RestPanelComponent implements OnInit {
  requestMethods: string[] = Object.values(RequestMethod);
  @Output() requestMethodEvent = new EventEmitter<RequestMethod>();
  selectedMethod: RequestMethod = RequestMethod.GET;
  ngOnInit() {
    this.requestMethodEvent.emit(this.selectedMethod);
  }
}
