import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { createLocalAudioTrack, createLocalVideoTrack } from "twilio-video";

@Injectable({
  providedIn: "root",
})
export class DeviceService {
  //active tracks  information
  audioTrack = new BehaviorSubject<any>(null); // default microphone
  videoTrack = new BehaviorSubject<any>(null); // default camera
  // screenTrack = new BehaviorSubject<any>(null); //for screen share
  videoOptions;

  constructor() {}

  // initialize particular
  init(type, options=null) {
    switch (type) {
      case "audio": {
        this.getAudioTracks();
        break;
      }
      case "video": {
        this.getVideoTracks(options);
        this.videoOptions = options;
        break;
      }
      case "screen": {
        this.getScreenTracks();
        break;
      }
      default:{
        break;
      }
    }
  }

  //disable
  disable(type) {
    switch (type) {
      case "audio": {
        if(this.audioTrack.getValue()){
          this.audioTrack.getValue().stop();
          this.audioTrack.next(null);
          console.log("Audio source disabled");
        }
        break;
      }
      case 'video':{
        if(this.videoTrack.getValue()){
          this.videoTrack.getValue().stop();
          this.videoTrack.next(null);
        }
        break;
      }
      case 'screen':{
        break;
      }
    }
  }
  // load audio track
  async getAudioTracks() {
    try {
      let track = await createLocalAudioTrack({ name: "microphone" });
      this.audioTrack.next(track);
      console.log(track);
    } catch (err) {
      console.log(`ERROR: Audio Source Busy, ${err}`);
      // throw(err);
    }
  }

  // load video track
  async getVideoTracks(options) {
    try {
      let tracks = await createLocalVideoTrack({
        name: "camera",
        width: options?.width || 420,
        height: options?.height || 380,
      });
      if(options && options?.attach){
        // attack track
        this.attachTrack(options['attach'],tracks);
      }
      this.videoTrack.next(tracks);
      console.log(tracks);
    } catch (err) {
      console.log(`ERROR: Video Source Busy, ${err}`);
      // throw(err);
    }
  }

  //attach track to element
  attachTrack(id,track){
    if(!id || !track){
      console.error(`Invalid arguments, ID:${id},Track:${track}`)
      return;
    }
    track = Array.isArray(track)?track[0]:track;
    let e = document.getElementById(id);
    if(e){
      e.appendChild(track.attach())
    }
    else{
      console.error("Element doesn't exist");
    }
  }

  // load screen track
  async getScreenTracks() {}



  //enable / disable tracks
  // disable track
  disableTrack(type){
    let track;
    switch(type){
      case 'audio':{
        track = this.audioTrack.getValue();
        this.audioTrack.next(null);
        break;
      }
      case 'video':{
        track = this.videoTrack.getValue();
        this.videoTrack.next(null);
        break;
      }
    }
    track.stop();
  }

  //enable Track
  enableTrack(type){
    let options = {};
    switch(type){
      case 'audio':{
        break;
      }
      case 'video':{
        options = this.videoOptions;
        break;
      }
    }
    this.init(type,options);
  }

  // local tracks array
  getLocalTracks(types){
    let tracks = [];
    types.forEach((type)=>{
      switch(type){
        case 'audio':{
          tracks.push(this.audioTrack.getValue());
          break;
        }
        case 'video':{
          tracks.push(this.videoTrack.getValue());
          break;
        }
      }
    });
    return tracks;
  }
}
