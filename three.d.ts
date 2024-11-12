declare module 'three' {
    export * from 'three/build/three';
  }
  
  declare module 'three/examples/jsm/controls/OrbitControls' {
    import { Camera, Scene, Vector3 } from 'three';
  
    export class OrbitControls {
      constructor(object: Camera, domElement: HTMLElement);
      update(): void;
      enableDamping: boolean;
      dampingFactor: number;
      screenSpacePanning: boolean;
      enableZoom: boolean;
      minDistance: number;
      maxDistance: number;
      maxPolarAngle: number;
      static readonly STATE: {
        NONE: number;
        ROTATE: number;
        ZOOM: number;
        PAN: number;
      };
    }
  }
  