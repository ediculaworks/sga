declare module 'react-map-gl' {
  import { ComponentType, CSSProperties, ReactNode, RefObject } from 'react';

  export interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
  }

  export interface MapProps {
    ref?: RefObject<any>;
    initialViewState?: ViewState;
    mapStyle?: string;
    mapboxAccessToken?: string;
    style?: CSSProperties;
    children?: ReactNode;
    reuseMaps?: boolean;
    [key: string]: any;
  }

  export interface MarkerProps {
    longitude: number;
    latitude: number;
    anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    onClick?: (e: any) => void;
    children?: ReactNode;
  }

  export interface PopupProps {
    longitude: number;
    latitude: number;
    anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    onClose?: () => void;
    closeButton?: boolean;
    closeOnClick?: boolean;
    className?: string;
    children?: ReactNode;
  }

  export interface NavigationControlProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  }

  export interface FullscreenControlProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  }

  const Map: ComponentType<MapProps>;
  const Marker: ComponentType<MarkerProps>;
  const Popup: ComponentType<PopupProps>;
  const NavigationControl: ComponentType<NavigationControlProps>;
  const FullscreenControl: ComponentType<FullscreenControlProps>;

  export default Map;
  export { Marker, Popup, NavigationControl, FullscreenControl };
}
