import { useRef, useEffect } from 'react';

export const useOrbitalCamera = () => {
  // Reference to hold cleanup function for active animation
  const orbitEventRemover = useRef<any>(null);
  
  const setup = (cesium: any, cesiumMap: any) => {
    // Stop any existing orbital animation
    const stopOrbitalAnimation = () => {
      if (orbitEventRemover.current?.cleanup) {
        orbitEventRemover.current.cleanup();
        orbitEventRemover.current = null;
      }
    };

    return {
      startOrbitalAnimation: (center: any, radius: number, startHeading?: number) => {
        stopOrbitalAnimation();
        
        const currentHeading = startHeading !== undefined ? startHeading : cesiumMap.camera.heading;
        const currentPitch = cesiumMap.camera.pitch;
        
        const orbitState = {
          center: center,
          radius: radius,
          heading: currentHeading,
          pitch: currentPitch,
          isActive: true
        };
        
        const updateOrbit = () => {
          if (!orbitState.isActive) return;
          
          // Slow continuous rotation - 0.2 degrees per frame
          orbitState.heading += cesium.Math.toRadians(0.2);
          
          cesiumMap.camera.lookAt(
            orbitState.center,
            new cesium.HeadingPitchRange(orbitState.heading, orbitState.pitch, orbitState.radius)
          );
        };
        
        // Register animation with Cesium's render loop
        const eventRemover = cesiumMap.scene.preUpdate.addEventListener(updateOrbit);
        
        // Set up handler for ALL mouse interactions
        const cameraHandler = new cesium.ScreenSpaceEventHandler(cesiumMap.scene.canvas);
        
        // All mouse events that should stop the animation
        const eventTypes = [
          cesium.ScreenSpaceEventType.LEFT_DOWN,
          cesium.ScreenSpaceEventType.MIDDLE_DOWN,
          cesium.ScreenSpaceEventType.RIGHT_DOWN,
          cesium.ScreenSpaceEventType.WHEEL,
          cesium.ScreenSpaceEventType.PINCH_START
        ];
        
        // Single callback for all events
        const inputCallback = () => {
          if (orbitState.isActive) {
            stopOrbitalAnimation();
          }
        };
        
        // Register callback for each event type
        eventTypes.forEach(eventType => {
          cameraHandler.setInputAction(inputCallback, eventType);
        });
        
        // Store cleanup function
        orbitEventRemover.current = {
          cleanup: () => {
            eventRemover();
            cameraHandler.destroy();
            orbitState.isActive = false;
          }
        };
      },
      
      // Exposed function to stop animation
      stopOrbitalAnimation,
      
      calculateOrbitRadius: (boundingSphere: any) => {
        if (!boundingSphere) return 1000; // Fallback default
        return boundingSphere.radius * 2.5; // Adjustable view distance multiplier
      }
    };
  };
  
  useEffect(() => {
    return () => {
      if (orbitEventRemover.current?.cleanup) {
        orbitEventRemover.current.cleanup();
      }
    };
  }, []);
  
  return { setup };
};

export default useOrbitalCamera;