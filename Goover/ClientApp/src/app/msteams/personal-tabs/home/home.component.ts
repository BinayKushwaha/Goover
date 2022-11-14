import { Component, OnInit } from '@angular/core';
import { Console, error, log } from 'console';
import { SubmitType } from '../../../Enum/submitType.enum';
import { CountryCode } from '../../../models/countryCode.model';
import { PhoneNumber } from '../../../models/phoneNumber.model';
import { AuthenticationToken } from '../../../models/token.model';
import { HomeService } from '../../../services/home.service';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  countryCodes: CountryCode[] = [];
  isLoginEnabled = false;
  isEmailTabSelected: boolean = false;
  isSmsCoodeSent: boolean = false;
  isEmailCodeSent: boolean = false;

  activeTab = 1;
  deviceId: string = "";
  secretKey: string = ""
  accessToken: string = "";

  emailValidationError: string = "";
  phoneValidationError: string = "";
  codeValidationError: string = "";
  loginValidationError: string = "";

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
    this.validate(SubmitType.RequestVerificationByPhone.valueOf());
    if (this.phoneValidationError.length == 0) {
      this.homeService.postRequestVerificationByPhone(this.selectedCountryCode, this.PhoneNumber).subscribe(result => {
        if (result) {
          this.isSmsCoodeSent = true;
          this.isLoginEnabled = true;
        }
      }, (error) => {
        console.log("Error occured while calling API: postRequestVerificationByPhone", error);
      })
    }
  }

  requestVerificationByEmail() {
    this.validate(SubmitType.RequestVerificationByEmail.valueOf());
    if (this.emailValidationError.length == 0) {
      this.homeService.postRequestVerificationByEmail(this.email).subscribe(result => {
        if (result) {
          this.isEmailCodeSent = true;
          this.isLoginEnabled = true;
        }
      },
        (error) => {
          console.log("Error occured while calling API: postRequestVerificationByEmail", error);
        });
    }
  }

  loginSubmit() {
    if (this.activeTab == 1) {
      this.validate(SubmitType.LoginByPhone.valueOf());

      if (this.loginValidationError.length == 0 && this.phoneValidationError.length == 0 && this.codeValidationError.length == 0) {

        //console.log("deviceID.", this.deviceId);
        this.homeService.verifySmsCode(this.selectedCountryCode, this.PhoneNumber, this.PhoneNumber, this.SmsCode).
          pipe(switchMap((isCodeVerified) => {
            if (isCodeVerified) {
              return this.homeService.authenticate(this.PhoneNumber, this.SmsCode, this.smsRememberMeChecked, this.deviceId).
                pipe(switchMap((data) => {
                  return this.homeService.getAuthenticationToken(data.secret_key).pipe(map(token => {
                    this.accessToken = token.id_token;
                    console.log("Got token successfully.");
                  }))
                }))
            } else {
              return [];
            }
          })).subscribe(result => {
            console.log(result)
          });
      }
    }

    else if (this.activeTab == 2) {
      this.validate(SubmitType.LoginByEmail.valueOf());

      // verify email code
      if (this.loginValidationError.length == 0 && this.emailValidationError.length == 0 && this.codeValidationError.length == 0) {
        this.homeService.verifyEmailCode(this.email, this.email, this.emailCode).
          pipe(switchMap((isCodeVerified) => {
            if (isCodeVerified) {
              return this.homeService.authenticate(this.email, this.emailCode, this.emailRememberMeChecked, this.deviceId).
                pipe(switchMap((data) => {
                  return this.homeService.getAuthenticationToken(data.secret_key).pipe(map(token => {
                    this.accessToken = token.id_token
                  }))
                }))
            } else {
              return [];
            }
          })).subscribe(ret => {
            console.log(ret)
          });
      }
    }
  }

  ///HELPER

  /// Generates new GUID as deviceID
  private getDeviceID() {
    return crypto.randomUUID();
  }

  validate(type: string) {
    this.emailValidationError = "";
    this.phoneValidationError = "";
    this.loginValidationError = "";

    var numberRegExP = new RegExp(/^[0-9]*$/);
    var emailRegExp = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    if (type == SubmitType.RequestVerificationByPhone.valueOf()) {
      if (this.selectedCountryCode.length != 0 && this.PhoneNumber.length != 0) {

        if (!numberRegExP.test(this.PhoneNumber)) {
          this.phoneValidationError = "The phonenumber is not valid.";

        }
      } else {
        this.phoneValidationError = "Both country code and phonenumber are required.";
      }
    } else if (type == SubmitType.RequestVerificationByEmail.valueOf()) {
      if (this.email.length != 0) {
        if (!emailRegExp.test(this.email)) {
          this.emailValidationError = "The email format is invalid.";
        }
      } else {
        this.emailValidationError = "The emai is required.";
      }
    } else if (type == SubmitType.LoginByPhone.valueOf()) {
      if (this.selectedCountryCode.length != 0 && this.PhoneNumber.length != 0 && this.SmsCode.length != 0) {
        if (!numberRegExP.test(this.PhoneNumber)) {
          this.phoneValidationError = "The phonenumber is not valid.";
        }
        if (!numberRegExP.test(this.SmsCode)) {
          this.codeValidationError = "The code is not valid.";
        }
      } else {
        this.loginValidationError = "Country code, phonenumber and code are required.";
      }
    } else if (type == SubmitType.LoginByEmail.valueOf()) {
      if (this.email.length != 0 && this.emailCode.length != 0) {
        if (!emailRegExp.test(this.email)) {
          this.emailValidationError = "The email format is invalid.";
        }
        if (!numberRegExP.test(this.SmsCode)) {
          this.emailValidationError = "The code is not valid.";
        }
      } else {
        this.loginValidationError = "The emai and code is required.";
      }
    } else {
      console.log("Invalid type. Method: Validate().")
    }
  }

  changeLoginOption() {
    this.isLoginEnabled = false;
    this.codeValidationError = "";
    this.emailValidationError = "";
    this.phoneValidationError = "";

    if (this.activeTab == 1) {
      this.selectedCountryCode = "";
      this.PhoneNumber = "";
      this.SmsCode = "";
      this.smsRememberMeChecked = false;
    }
    if (this.activeTab == 2) {
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
        console.log("Error occured while calling API: getCountryCode", error);
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
