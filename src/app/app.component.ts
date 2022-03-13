import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { setOptions, MbscEventcalendarView, MbscCalendarEvent, MbscEventcalendarOptions, MbscPopup } from '@mobiscroll/angular';
import { AppService } from './app.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';

setOptions({
  theme: 'ios',
  themeVariant: 'light'
});
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  invalid = [{
    // disable weekends
    recurring: {
      repeat: 'weekly',
      weekDays: 'SA,SU'
    }
  }];
  selectedThemeVariant = 2;
  selectedTheme = 1;

  @ViewChild('popup', { static: false }) tooltip!: MbscPopup;
  @ViewChild('myEvent')
  private myEventRef: TemplateRef<any>;

  eventSettings: MbscEventcalendarOptions = {
    theme: 'ios',
    themeVariant: 'light',
    clickToCreate: false,
    dragToCreate: false,
    dragToMove: false,
    dragToResize: false,
    onEventClick: (event, inst) => {
      this.modalRef = this.modalService.show(
        this.myEventRef,
        Object.assign({}, {
          animated: true,
          keyboard: true,
          backdrop: true,
          ignoreBackdropClick: true
        }, { class: 'modal-vl' })
      );

      const selectedValue: any = this.myEvents.filter(data => data.id == event.event.id && data.resource == event.event.resource)[0];
      this.eventForm.patchValue(selectedValue);
      this.eventForm.patchValue({
        start: moment(selectedValue.start).format("yyyy-MM-DDThh:mm"),
        end: moment(selectedValue.end).format("yyyy-MM-DDThh:mm"),
      });
    }
  };

  view: MbscEventcalendarView = {
    calendar: { type: 'week' },
    timeline: {
      type: 'day', startDay: 1, endDay: 5
    }
  };

  myEvents: MbscCalendarEvent[] = [];
  myResources: any = [];
  modalRef: BsModalRef;

  eventForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public modalService: BsModalService,
    private appService: AppService,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.getData();
  }

  private buildForm() {
    this.eventForm = this.fb.group({
      id: [''],
      resource: [''],
      title: ['', [Validators.required]],
      summary: ['', [Validators.required, Validators.maxLength(250)]],
      start: ['', [Validators.required]],
      end: ['', [Validators.required]]
    }, { validator: this.appService.dateLessThan('start', 'end') });
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  submitForm() {
    if (!this.eventForm.valid) {
      this.eventForm.markAllAsTouched();
    }
    const param = {
      id: this.eventForm.value.id,
      title: this.eventForm.value.title,
      summary: this.eventForm.value.summary,
      labels: this.eventForm.value.resource,
      startDate: new Date(this.eventForm.value.start).valueOf() / 1000,
      endDate: new Date(this.eventForm.value.end).valueOf() / 1000,
    }
    this.appService.httpPut(`notes/${this.eventForm.value.id}`, param).subscribe((response: any) => {
      response = response.noteData;
      const index: any = this.myEvents.findIndex(data => data.id == response.id && data.resource == response.labels);
      this.myEvents[index] = {
        id: parseInt(response.id),
        start: this.appService.convertToDateFormat(response.startDate),
        resource: response.labels,
        end: this.appService.convertToDateFormat(response.endDate),
        title: response.title,
        summary: response.summary
      };
      const tempMyEvent = this.myEvents;
      this.myEvents = [];
      setTimeout(() => {
        this.myEvents = tempMyEvent;
      }, 500);
      this.modalService.hide();
    });
  }

  async getData() {
    this.appService.httpGet('noteLabels').subscribe((response: any) => {
      this.myResources = this.appService.convertToLabels(response);
    });

    this.appService.httpGet('notes').subscribe(response => {
      this.myEvents = this.appService.convertToCalender(response?.notes || []);
    });
  }

  filter(_event: any): void {

    this.eventSettings.themeVariant = this.selectedThemeVariant == 2 ? 'light' : 'dark';
    if (this.selectedTheme == 1) {
      this.eventSettings.theme = 'ios'
    } else if (this.selectedTheme == 2) {
      this.eventSettings.theme = 'windows'
    } else if (this.selectedTheme == 3) {
      this.eventSettings.theme = 'material'
    }
  }

}
