import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

import { RestPanelComponent } from "./rest-panel.component";

describe("RestPanelComponent", () => {
  let component: RestPanelComponent;
  let fixture: ComponentFixture<RestPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, RestPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RestPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
