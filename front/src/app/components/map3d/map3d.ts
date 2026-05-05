import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoomService } from '../../services/room.service';
import { FloorService } from '../../services/floor.service';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-map-3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <nav class="left-sidebar">
        <div class="logo"><i class="fa-solid fa-cube"></i> Plan 3D</div>
        <div class="menu-section">
          <div class="section-title">Étage</div>
          <div class="floor-selector">
            <button *ngFor="let f of availableFloors" (click)="selectFloor(f)" [class.active]="selectedFloor === f">
              {{ f === 0 ? 'RDC' : 'Étage ' + f }}
            </button>
          </div>
        </div>
      </nav>

      <div class="map-viewport" style="position: relative; flex: 1; overflow: hidden;">
        <div #rendererContainer style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;"></div>
        <div #labelContainer style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none;"></div>
      </div>
    </div>
  `,
  styleUrls: ['../map/map.css']
})
export class Map3dComponent implements OnInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;
  @ViewChild('labelContainer', { static: true }) labelContainer!: ElementRef;
  @Output() roomSelected = new EventEmitter<string>();

  private scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  private labelRenderer = new CSS2DRenderer();
  private controls!: OrbitControls;
  private animationId: number = 0;
  private roomMeshMap = new Map<THREE.Mesh, string>();
  private roomMeshes: THREE.Mesh[] = [];
  private roomLabels: CSS2DObject[] = [];

  allRooms: Room[] = [];
  availableFloors: number[] = [];
  selectedFloor = 0;

  constructor(
    private roomService: RoomService,
    private floorService: FloorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initThreeJs();
    this.loadData();
    this.setupEventListeners();
  }

  private initThreeJs() {
    const width = this.rendererContainer.nativeElement.clientWidth || window.innerWidth;
    const height = this.rendererContainer.nativeElement.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    this.camera.position.set(400, 500, 800);

    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xf1f5f9, 1);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.labelRenderer.setSize(width, height);
    this.labelContainer.nativeElement.appendChild(this.labelRenderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.update();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(200, 500, 300);
    this.scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(2000, 40, 0xcbd5e1, 0xe2e8f0);
    this.scene.add(gridHelper);

    this.animate();
  }

  private loadData() {
    this.floorService.getFloors().subscribe(floors => {
      this.availableFloors = [...new Set(floors.map(f => f.level))].sort((a, b) => a - b);
      if (this.availableFloors.length > 0 && !this.availableFloors.includes(this.selectedFloor)) {
        this.selectedFloor = this.availableFloors[0];
      }
      this.cdr.detectChanges();
    });

    this.roomService.getRooms().subscribe(rooms => {
      this.allRooms = rooms;
      this.buildFloor();
    });
  }

  selectFloor(floor: number) {
    this.selectedFloor = floor;
    this.buildFloor();
  }

  private buildFloor() {
    this.roomMeshes.forEach(mesh => this.scene.remove(mesh));
    this.roomLabels.forEach(label => this.scene.remove(label));
    this.roomMeshes = [];
    this.roomLabels = [];
    this.roomMeshMap.clear();

    const floorRooms = this.allRooms.filter(room => room.floor === this.selectedFloor);
    const wallHeight = 25;
    const wallThickness = 4;

    floorRooms.forEach(room => {
      const material = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
      const cx = room.coordinates.x + room.coordinates.width / 2;
      const cz = room.coordinates.y + room.coordinates.height / 2;

      const walls = [
        { w: room.coordinates.width + wallThickness * 2, d: wallThickness, x: cx, z: room.coordinates.y },
        { w: room.coordinates.width + wallThickness * 2, d: wallThickness, x: cx, z: room.coordinates.y + room.coordinates.height },
        { w: wallThickness, d: room.coordinates.height, x: room.coordinates.x, z: cz },
        { w: wallThickness, d: room.coordinates.height, x: room.coordinates.x + room.coordinates.width, z: cz }
      ];

      walls.forEach(w => {
        const geo = new THREE.BoxGeometry(w.w, wallHeight, w.d);
        const mesh = new THREE.Mesh(geo, material);
        mesh.position.set(w.x - 500, wallHeight / 2, w.z - 300);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x64748b }));
        mesh.add(line);

        this.scene.add(mesh);
        this.roomMeshes.push(mesh);
        this.roomMeshMap.set(mesh, room.id);
      });

      const div = document.createElement('div');
      div.className = 'room-label';
      div.style.background = 'rgba(255,255,255,0.8)';
      div.style.padding = '4px 8px';
      div.style.borderRadius = '4px';
      div.style.fontSize = '12px';
      div.textContent = room.name;
      const label = new CSS2DObject(div);
      label.position.set(cx - 500, 2, cz - 300);
      this.scene.add(label);
      this.roomLabels.push(label);
    });
  }

  private setupEventListeners() {
    this.rendererContainer.nativeElement.addEventListener('click', (event: MouseEvent) => {
      this.onMouseClick(event);
    });

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private onMouseClick(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    
    const intersects = raycaster.intersectObjects(this.roomMeshes);
    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const roomId = this.roomMeshMap.get(mesh);
      if (roomId) {
        this.roomSelected.emit(roomId);
      }
    }
  }

  private onWindowResize() {
    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.labelRenderer.setSize(width, height);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.renderer.dispose();
    this.labelRenderer.domElement.remove();
    this.roomMeshMap.clear();
    this.roomMeshes = [];
    this.roomLabels = [];
  }
}
