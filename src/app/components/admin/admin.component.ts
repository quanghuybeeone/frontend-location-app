import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  locations: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    // Thiết lập kết nối SSE
    const eventSource = new EventSource('http://localhost:8000/sse');
    
    // Xử lý sự kiện nhận thông tin real-time
    eventSource.addEventListener('message', (event) => {
      this.getLocations();
    });
  }


  getLocations() {    
    this.http.get<any[]>('http://localhost:8000/locations')
      .subscribe(
        data => {
          this.locations = data;
        },
        error => {
          console.log(error);
        }
      );
  }

  controlLocation(location: any, newStatus: string): void {
    const id = location.id;
    // const newStatus = 'approved'; // Hoặc 'rejected', tùy thuộc vào trạng thái

    // Gọi API để cập nhật trạng thái của địa điểm
    this.http.put('http://localhost:8000/locations/' + id, { status: newStatus })
      .subscribe(
        data => {
          // console.log('Location updated successfully');
          // Cập nhật lại danh sách địa điểm sau khi thay đổi trạng thái
          this.getLocations();
        },
        error => {
          console.log(error);
        }
      );
  }
}
