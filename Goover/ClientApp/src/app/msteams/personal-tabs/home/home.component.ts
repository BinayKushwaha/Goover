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
  activeTab = 1;
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
    console.log(this.email);
    this.homeService.postRequestVerificationByEmail(this.email).subscribe(result => {
      console.log(result);
      if (result) {
        this.isLoginEnabled = true;
      }
    },
      error => {
        console.error("Error occured while calling API: postRequestVerificationByEmail", error);
      });
  }

  loginSubmit() {
    if (this.activeTab == 1) {

      //verify sms code
      this.homeService.verifySmsCode(this.selectedCountryCode, this.PhoneNumber, this.PhoneNumber, this.SmsCode).subscribe(result => {
        if (result) {
          //enable login input fields
          this.isLoginEnabled = true;

          console.log("sms code successful");

          //authenticate via phone number
          this.login(this.PhoneNumber, this.SmsCode, this.smsRememberMeChecked);
        }
      },
        error => {
          console.error("Error occured while calling API: verifySmsCode", error);
        });
    }
    else if (this.activeTab == 2) {

      // verify email code
      this.homeService.verifyEmailCode(this.email, this.email, this.emailCode).subscribe(result => {
        if (result) {

          console.log("email code successful");

          //enable login input fields
          this.isLoginEnabled = true;

          //authenticate via email
          this.login(this.email, this.emailCode, this.emailRememberMeChecked)
        }
      }, error => {
        console.error("Error occured while calling API: verifyEmailCode", error);
      });
    }
  }

  login(username: string, password: string, rememberMe: boolean) {

    console.log("authentication started.")

    this.homeService.authenticate(username, password, rememberMe, this.deviceId).subscribe(res => {
      if (res != null && res.secret_key != null) {
        this.secretKey = res.secret_key;

        console.log("authentication completed.")
        console.log("Successfully got secret key");

        this.homeService.getAuthenticationToken(res.secret_key).subscribe(res => {
          if (res != null && res.secret_key != null) {
            this.accessToken = res.id_token;

            console.log("Login successful");
            console.log("access token", this.accessToken);
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
