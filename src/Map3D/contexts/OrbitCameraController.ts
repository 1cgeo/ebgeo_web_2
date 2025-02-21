export class OrbitCameraController {
  private camera: any;
  private scene: any;
  private eventHandler: any;
  private isOrbiting: boolean = false;
  private preUpdateListener: any;
  private rotationAngle: number = 0;
  private currentModelId: string | null = null;
  private cleanupTimer: number | null = null;
  private cesium: any;

  constructor(cesiumMap: any, cesium: any) {
    if (!cesiumMap || !cesiumMap.camera || !cesiumMap.scene || !cesium) {
      throw new Error('Invalid Cesium map or instance');
    }

    this.camera = cesiumMap.camera;
    this.scene = cesiumMap.scene;
    this.cesium = cesium;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.eventHandler) {
      this.eventHandler = new this.cesium.ScreenSpaceEventHandler(this.scene.canvas);
    }
    
    this.eventHandler.setInputAction(
      () => this.stopOrbit(), 
      this.cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
    this.eventHandler.setInputAction(
      () => this.stopOrbit(), 
      this.cesium.ScreenSpaceEventType.WHEEL
    );
    this.eventHandler.setInputAction(
      () => this.stopOrbit(), 
      this.cesium.ScreenSpaceEventType.LEFT_DOWN
    );
  }

  startOrbit(position: any, modelId: string, options = {
    radius: 200,
    speed: 0.3,
    pitch: -45
  }) {
    if (!position || !modelId) {
      console.warn('Invalid parameters for orbit');
      return;
    }

    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.stopOrbit();

    try {
      this.isOrbiting = true;
      this.currentModelId = modelId;
      this.rotationAngle = 0;

      const pitchRadians = this.cesium.Math.toRadians(options.pitch);

      if (!this.camera || !this.scene) {
        throw new Error('Camera or scene not available');
      }

      this.preUpdateListener = this.scene.preUpdate.addEventListener(() => {
        if (!this.isOrbiting || !this.currentModelId) return;

        try {
          this.rotationAngle += options.speed;
          if (this.rotationAngle >= 360) {
            this.rotationAngle -= 360;
          }

          const heading = this.cesium.Math.toRadians(this.rotationAngle);
          
          this.camera.setView({
            destination: position,
            orientation: {
              heading: heading,
              pitch: pitchRadians,
              roll: 0
            }
          });

          this.camera.moveBackward(options.radius);
        } catch (error) {
          console.error('Error during orbit update:', error);
          this.stopOrbit();
        }
      });
    } catch (error) {
      console.error('Error starting orbit:', error);
      this.stopOrbit();
    }
  }

  stopOrbit() {
    this.isOrbiting = false;
    this.currentModelId = null;

    if (this.preUpdateListener) {
      try {
        this.scene.preUpdate.removeEventListener(this.preUpdateListener);
      } catch (error) {
        console.warn('Error removing orbit listener:', error);
      }
      this.preUpdateListener = undefined;
    }
  }

  modelRemoved(modelId: string) {
    if (this.currentModelId === modelId) {
      this.stopOrbit();
    }
  }

  isOrbitingModel(modelId: string): boolean {
    return this.isOrbiting && this.currentModelId === modelId;
  }

  destroy() {
    this.stopOrbit();
    
    this.cleanupTimer = window.setTimeout(() => {
      if (this.eventHandler) {
        try {
          this.eventHandler.destroy();
          this.eventHandler = null;
        } catch (error) {
          console.warn('Error destroying event handler:', error);
        }
      }
    }, 0);
  }
}