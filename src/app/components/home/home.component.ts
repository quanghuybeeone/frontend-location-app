import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  apiLoaded: Observable<boolean>;
  locationForm: FormGroup;
  selectedMarkerPosition: any;

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  constructor(private formBuilder: FormBuilder, private httpClient: HttpClient) {
    this.apiLoaded = this.loadGoogleMapsAPI();

    this.locationForm = this.formBuilder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      types: ['', Validators.required],
    });
  }

  loadGoogleMapsAPI(): Observable<boolean> {
    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAV5-A9yH8MaNYlsx3rd_xIgeyGQPBszQo&libraries=visualization`;
    return this.httpClient.jsonp(scriptUrl, 'callback').pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  center: google.maps.LatLngLiteral = {
    lat: 10.808900959740662,
    lng: 106.63094249064932
  };
  zoom = 12;

  

  getMarkerOptions(type: string): google.maps.MarkerOptions {
    let iconUrl = '';
  
    // Xác định đường dẫn biểu tượng dựa trên loại
    switch (type) {
      case 'supermarket':
        iconUrl = 'assets/icon1.png';
        break;
      case 'school':
        iconUrl = 'assets/icon2.png';
        break;
      case 'park':
        iconUrl = 'assets/icon3.png';
        break;
      case 'hospital':
        iconUrl = 'assets/icon4.png';
        break;
      default:
        iconUrl = 'assets/icon0.png';
        break;
    }
  
    const markerOptions: google.maps.MarkerOptions = {
      draggable: false,
      icon: {
        url: iconUrl,
        scaledSize: new google.maps.Size(50, 60),
      },
    };
  
    return markerOptions;
  }

  markerPositions: any = [];
  selectedLocation: any;

  mapClicked(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.selectedLocation = event.latLng.toJSON();
      this.scanMap()
    }
  }

  scanMap() {
    if (this.selectedLocation) {
      const apiUrl = 'http://localhost:8000/submit-location';
      const requestBody = {
        latitude: this.selectedLocation.lat,
        longitude: this.selectedLocation.lng
      };

      this.httpClient.post(apiUrl, requestBody).subscribe(
        (response) => {
          // console.log('Locations scanned and stored in the database:', response);
          this.markerPositions = response
          console.log(this.markerPositions);
          
        },
        (error) => {
          console.error('Error scanning and storing locations:', error);
        }
      );
    }
  }

  openInfoWindow(marker: any) {
    console.log(marker);
    const markerPosition: google.maps.LatLngLiteral = {
      lat: marker.lat,
      lng: marker.lng
    };

    this.selectedMarkerPosition = {
      lat: marker.lat,
      lng: marker.lng,
      name: marker.name,
      types: marker.types,
      address: marker.address,
    }
  
    this.infoWindow.position = markerPosition;
    this.infoWindow.open();
  }


  onSubmit() {
    if (this.locationForm.invalid) {
      return;
    }

    if (!this.selectedLocation){
      alert('Vui lòng chọn vị trí trên bảng đồ')
      return;
    }

    const locationData = this.locationForm.value;
    locationData.longitude = this.selectedLocation.lng
    locationData.latitude = this.selectedLocation.lat
    locationData.status = "pending"
    console.log(locationData);
    
    this.httpClient.post('http://localhost:8000/locations', locationData).subscribe(
      response => {
        console.log('Đã lưu lại vị trí:', response);
        alert('Đã gửi thông tin vị trí thành công, chờ phê duyệt')
        // Xử lý phản hồi từ backend (nếu cần)
      },
      error => {
        console.error('Lỗi khi gửi yêu cầu:', error);
        // Xử lý lỗi (nếu cần)
      }
    );
  }

  

  
}
