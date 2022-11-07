import { Component, OnInit } from '@angular/core';
import { error, log } from 'console';
import { CountryCode } from '../../../models/countryCode.model';
import { PhoneNumber } from '../../../models/phoneNumber.model';
import { AuthenticationToken } from '../../../models/token.model';
import { HomeService } from '../../../services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  countryCodes: CountryCode[] = [];
  isLoginEnabled = false;
  active = 1;
  deviceId: string = '';
  secretKey: string = ""
  accessToken: string = "";

  isEmailTabSelected: boolean = false;
  selectedCountryCode: string = "";
  PhoneNumber: string = "";
  SmsCode: string = "";
  email: string = "";
  emailRememberMeChecked: boolean = false;
  smsRememberMeChecked: boolean = false;
  emailCode: string = "";

  constructor(
    private homeService: HomeService
  ) { }

  ngOnInit(): void {
    this.getCountryCode();
    this.deviceId = this.getDeviceID();
  }

  requestVerificationByPhone() {
    this.homeService.postRequestVerificationByPhone(this.selectedCountryCode, this.PhoneNumber).subscribe(result => {
      if (result) {
        this.isLoginEnabled = true;
      }
    }, error => {
      console.error("Error occured while calling API: postRequestVerificationByPhone", error);
    })
  }

  requestVerificationByEmail() {
    this.homeService.postRequestVerificationByEmail(this.email).subscribe(result => {
      if (result) {
        this.isLoginEnabled = true;
      }
    },
      error => {
        console.error("Error occured while calling API: postRequestVerificationByEmail", error);
      });
  }
  
  verifySmsCode(countryCode: string, phoneNumber: string, login: string, code: string) {
    this.homeService.verifySmsCode(countryCode, phoneNumber, login, code).subscribe(result => {
      if (result) {
        this.isLoginEnabled = true;
      }
    },
      error => {
        console.error("Error occured while calling API: postRequestVerificationByEmail", error);
      });
  }

  verifyEmailCode(email: string, login: string, code: string) {
    this.homeService.verifyEmailCode(email, login, code).subscribe(result => {
      if (result) {
        this.isLoginEnabled = true;
      }
    }, error => {
      console.error("Error occured while calling API: postRequestVerificationByEmail", error);
    });
  }

  onLogin() {
    if (this.isEmailTabSelected) {

    }
  }

  login(username: string, password: string, rememberMe: boolean) {

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

  ///HELPER

  /// Generates new GUID as deviceID
  private getDeviceID() {
    return crypto.randomUUID();
  }

  changeLoginOption() {
    this.isLoginEnabled = false;
    if (this.active == 1) {
      this.selectedCountryCode = "";
      this.PhoneNumber = "";
      this.SmsCode = "";
      this.smsRememberMeChecked = false;
    }
    if (this.active == 2) {
      this.email = "";
      this.SmsCode = "";
      this.emailRememberMeChecked = false;
    }
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

  getEmailRememberMeCheckedInValue(value: boolean) {
    this.emailRememberMeChecked = value;
  }

  getSmsRememberMeCheckedInValue(value: boolean) {
    this.emailRememberMeChecked = value;
  }
}
