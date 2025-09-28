import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  // selector: 'app-header',
  // imports: [],
  // templateUrl: './header.html',
  // styleUrl: './header.css'
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  
}
