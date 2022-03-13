import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

const httpOptions: any = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
  providedIn: 'root'
})
export class AppService {
  apiEndPoint: string;

  constructor(public httpClient: HttpClient) {
    this.apiEndPoint = environment.eGroupAPI;
  }

  httpGet(endpoint: string = ''): Observable<any> {
    return this.httpClient.get(this.apiEndPoint + endpoint, httpOptions);
  }

  httpPut(endpoint: string = '', data: any): Observable<any> {
    return this.httpClient.put(this.apiEndPoint + endpoint, data, httpOptions);
  }

  convertToLabels(response: any) {
    let calenderObj = [];
    for (let i = 0; i < response.length; i++) {
      calenderObj.push({
        id: response[i].id,
        name: response[i].text,
      })
    }
    return calenderObj;
  }

  convertToCalender(response: any) {
    let calenderObj = [];
    for (let i = 0; i < response.length; i++) {
      for (let j = 0; j < response[i].labels.length; j++) {
        calenderObj.push({
          id: response[i].id,
          start: this.convertToDateFormat(response[i].startDate),
          resource: response[i].labels[j],
          end: this.convertToDateFormat(response[i].endDate),
          title: response[i].title,
          summary: response[i].summary
        });
      }
    }
    return calenderObj;
  }

  dateLessThan(from: string, to: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let f = group.controls[from];
      let t = group.controls[to];
      if (f.value > t.value) {
        return {
          dates: "Start Date should be greater than End Date"
        };
      }
      return {};
    }
  }

  convertToDateFormat(date: any) {
    return moment(date * 1000).format("yyyy-MM-DDThh:mm")
  }

}
