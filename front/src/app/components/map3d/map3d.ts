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

      <div class="map-viewport" style="position: relative; flex: 1; overflow: hidden; padding: 0;">
        <div #rendererContainer style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;"></div>
        <div #labelContainer style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none;"></div>
      </div>

      <aside class="side-panel" *ngIf="selectedRoom; else noSelection" style="z-index: 10;">
        <header>
          <span class="badge">{{ selectedRoom.room_type_label || 'Local' }}</span>
          <h2>{{ selectedRoom.name }}</h2>
        </header>

        <section class="info-card">
          <div class="section-title">Localisation</div>
          <div class="item-row">
            <div class="icon-box"><i class="fa-solid fa-location-dot"></i></div>
            <div>{{ selectedFloor === 0 ? 'RDC' : 'Étage ' + selectedFloor }}</div>
          </div>
        </section>

        <section class="info-card">
          <div class="section-title">Capacité & Sécurité</div>
          <div class="item-row">
            <div class="icon-box"><i class="fa-solid fa-people-group"></i></div>
            <div><strong>{{ selectedRoom.max_capacity }}</strong> personnes max</div>
          </div>
          <div class="item-row">
            <div class="icon-box"><i class="fa-solid fa-door-closed"></i></div>
            <div><strong>{{ selectedRoom.doors }}</strong> accès directs</div>
          </div>
        </section>

        <section *ngIf="selectedRoom.staff.length > 0">
          <div class="section-title">Personnel ({{ selectedRoom.staff.length }})</div>
          <ul class="item-list">
            <li *ngFor="let person of selectedRoom.staff" class="item-row">
              <div class="icon-box"><i class="fa-solid fa-user"></i></div>
              {{ person.fullName }}
            </li>
          </ul>
        </section>

        <button class="btn-primary" (click)="goToDetail()">
          <i class="fa-solid fa-pen-to-square"></i> Gérer le local
        </button>
      </aside>

      <ng-template #noSelection>
        <aside class="side-panel" style="z-index: 10;">
          <div class="empty-state">
            <i class="fa-solid fa-cube empty-icon"></i>
            <h3>Sélectionnez un local</h3>
            <p>Cliquez sur une salle en 3D pour voir ses détails.</p>
          </div>
        </aside>
      </ng-template>
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
  private readonly onResizeHandler = () => this.onWindowResize();
  private readonly onCanvasClickHandler = (event: MouseEvent) => this.onMouseClick(event);

  allRooms: Room[] = [];
  availableFloors: number[] = [];
  selectedFloor = 0;
  selectedRoom: Room | null = null;

  private roomMeshes: THREE.Mesh[] = [];
  private roomHitMeshes: THREE.Mesh[] = [];
  private roomMeshMap = new Map<THREE.Mesh, string>();
  private roomLabels: CSS2DObject[] = [];

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
    const width = window.innerWidth - 680;
    const height = window.innerHeight - 64;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    this.camera.position.set(400, 600, 800);

    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xf1f5f9, 1);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.labelRenderer.setSize(width, height);
    this.labelContainer.nativeElement.appendChild(this.labelRenderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.maxPolarAngle = Math.PI / 2.1;
    this.controls.target.set(0, 0, 0);
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
      if (this.availableFloors.length && !this.availableFloors.includes(this.selectedFloor)) {
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
    this.selectedRoom = null;
    this.buildFloor();
    this.cdr.detectChanges();
  }

  private buildFloor() {
    this.roomMeshes.forEach(mesh => this.scene.remove(mesh));
    this.roomHitMeshes.forEach(mesh => this.scene.remove(mesh));
    this.roomLabels.forEach(label => this.scene.remove(label));
    this.roomMeshes = [];
    this.roomHitMeshes = [];
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

        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x64748b }));
        mesh.add(line);

        this.scene.add(mesh);
        this.roomMeshes.push(mesh);
        this.roomMeshMap.set(mesh, room.id);
      });

      const hitGeometry = new THREE.BoxGeometry(room.coordinates.width, 2, room.coordinates.height);
      const hitMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
      hitMesh.position.set(cx - 500, 1, cz - 300);
      hitMesh.userData['roomId'] = room.id;
      this.scene.add(hitMesh);
      this.roomHitMeshes.push(hitMesh);

      const div = document.createElement('div');
      div.className = 'room-label';
      div.style.background = 'rgba(255,255,255,0.9)';
      div.style.border = '1px solid #cbd5e1';
      div.style.padding = '4px 8px';
      div.style.borderRadius = '4px';
      div.style.fontSize = '12px';
      div.style.fontWeight = 'bold';
      div.textContent = room.name;
      const label = new CSS2DObject(div);
      label.position.set(cx - 500, 2, cz - 300);
      this.scene.add(label);
      this.roomLabels.push(label);
    });
  }

  private setupEventListeners() {
    this.renderer.domElement.addEventListener('click', this.onCanvasClickHandler);
    window.addEventListener('resize', this.onResizeHandler);
  }

  private onMouseClick(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.roomHitMeshes);
    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const roomId = mesh.userData['roomId'] as string | undefined;
      if (roomId) {
        this.selectedRoom = this.allRooms.find(room => room.id === roomId) || null;
        this.cdr.detectChanges();
      }
    }
  }

  goToDetail(): void {
    if (this.selectedRoom) {
      this.roomSelected.emit(this.selectedRoom.id);
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
    window.removeEventListener('resize', this.onResizeHandler);
    this.renderer.domElement.removeEventListener('click', this.onCanvasClickHandler);
    this.controls?.dispose();
    this.renderer.dispose();
    this.labelRenderer.domElement.remove();
    this.roomMeshMap.clear();
    this.roomMeshes = [];
    this.roomHitMeshes = [];
    this.roomLabels = [];
  }
}
