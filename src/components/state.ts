import { IStateRecord } from "../types/types";

/* 
 state holds clients data in format 
 { Record<'client ID'>: 
  { 
    selected: { tbus:[] ,bus:[] }, // two lists of routes selected by client for observation
    bounds: [ lngLat, lngLat ]     // sw and ne bounding corners of client's map window
  }  
 */
export const state: Record<string, IStateRecord> = {};
