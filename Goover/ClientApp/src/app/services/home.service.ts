import { HttpClient } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { error, log } from 'console';
import { environment } from '../../environments/environment';
import { Auth } from '../models/auth.model';
import { Email } from '../models/email.model';
import { PhoneNumber } from '../models/phoneNumber.model';
import { AuthenticationToken } from '../models/token.model';
import { VerifyEmailCode } from '../models/verifyEmailCode.model';
import { VerifySmsCode } from '../models/verifySmsCode.model';

@Injectable({
  providedIn: 'root'
})

export class HomeService {

  baseUrl: string;
  deepSignalBaseUrl: string;

  constructor(
    private http: HttpClient,
  ) {
    this.baseUrl = environment.teamsAppBaseUrl;
    this.deepSignalBaseUrl = environment.deepSignalAiBaseUrl;
  }

  getCountryCodes() {
    return this.http.get<any>(this.deepSignalBaseUrl + `/api/public/getCountryCode`);
  }

  postRequestVerificationByPhone(countryCode: string, phoneNumber: string) {
    let request: PhoneNumber = {
      countryCode: countryCode,
      phoneNumber: phoneNumber
    }
    return this.http.post<any>(this.deepSignalBaseUrl + `/api/phone/send`, request)
  }

  postRequestVerificationByEmail(email: string) {
    let request: Email = {
      email: email
    };
    return this.http.post<any>(this.deepSignalBaseUrl + `/api/email/send`, request)
  }

  verifySmsCode(countryCode: string, phoneNumber: string, login: string, code: string) {
    let request: VerifySmsCode =
    {
      countryCode: countryCode,
      phoneNumber: phoneNumber,
      login: login,
      code: code
    };
    return this.http.post<any>(this.deepSignalBaseUrl + `/api/phone/verify`, request)
  }

  verifyEmailCode(email: string, login: string, code: string) {
    let request: VerifyEmailCode = {
      email: email,
      login: login,
      code: code
    };
    return this.http.post<any>(this.deepSignalBaseUrl + `/api/email/verify`, request);
  }

  authenticate(username: string, password: string, rememberMe: boolean, deviceId: string) {
    let request: Auth = {
      username: username,
      password: password,
      rememberMe: rememberMe,
      deviceId: deviceId
    };
    return this.http.post<AuthenticationToken>(this.deepSignalBaseUrl + `/api/authenticate`, request);
  }

  getAuthenticationToken(secretKey: string) {
    return this.http.get<AuthenticationToken>(this.deepSignalBaseUrl + `/api/public/getToken?${secretKey}`);
  }


}
