import { Component, OnInit } from '@angular/core';
import { error, log } from 'console';
import { CountryCode } from '../../../models/countryCode.model';
import { PhoneNumber } from '../../../models/phoneNumber.model';
import { AuthenticationToken } from '../../../models/token.model';
import { HomeService } from '../../../services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  countryCodes: CountryCode[] = [];
  isVerificationCodeEnabled = false;
  isLoginButtonEnabled = false;
  active = 1;
  deviceId: string = '';
  secretKey: string = ""
  accessToken: string = "";
  selectedCountryCode: string = "";

  constructor(
    private homeService: HomeService
  ) { }

  ngOnInit(): void {
    this.getCountryCode();
    this.deviceId = this.getDeviceID();
  }

  getCountryCode() {
    this.homeService.getCountryCodes().subscribe({
      next: data => {
        this.countryCodes = data;
      },
      error: error => {
        console.log("There was an error!", error);
      }
    });
  };

  changeLoginOption() {
    this.isVerificationCodeEnabled = false;
  }

  onSelectCountryCode(event: any) {
    this.selectedCountryCode = event.code;
  }

  requestVerificationByPhone(phoneNumber: string) {
    this.homeService.postRequestVerificationByPhone(this.selectedCountryCode, phoneNumber).subscribe(result => {
      if (result) {
        this.isVerificationCodeEnabled = true;
      }
    })
  }

  requestVerificationByEmail(email: string) {
    this.homeService.postRequestVerificationByEmail(email).subscribe(result => {
      if (result) {
        this.isVerificationCodeEnabled = true;
      }
    });
  }

  verifySmsCode(countryCode: string, phoneNumber: string, login: string, code: string) {
    this.homeService.verifySmsCode(countryCode, phoneNumber, login, code).subscribe(result => {
      if (result) {
        this.isLoginButtonEnabled = true;
      }
    });
  }

  verifyEmailCode(email: string, login: string, code: string) {
    this.homeService.verifyEmailCode(email, login, code).subscribe(result => {
      if (result) {
        this.isLoginButtonEnabled = true;
      }
    });
  }

  login(username: string, password: string, rememberMe: boolean) {
    this.homeService.authenticate(username, password, rememberMe, this.deviceId).subscribe({
      next: data => {

      },
      error: error => {
        console.log("There was an error!", error);
      }
    });

    this.homeService.authenticate(username, password, rememberMe, this.deviceId).subscribe(res => {
      if (res != null && res.secret_key != null) {
        this.secretKey = res.secret_key;
        this.homeService.getAuthenticationToken(res.secret_key).subscribe(res => {
          if (res != null && res.secret_key != null) {
            this.accessToken = res.id_token;
          }
        }, error => {
          console.error("Error occured while calling API: GetToken", error);
        })
      }
    }, error => {
      console.error("Error occured while calling API: Authenticate", error);
    });
  }

  /// Generates new GUID as deviceID
  private getDeviceID() {
    return crypto.randomUUID();
  }

}
