export interface ControllerConfig {
  path?: string;
}

export interface RouteConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'SEARCH' | 'PATCH';
  url?: string;
}

export interface ViewConfig {
  name?: string;
  url?: string;
}
