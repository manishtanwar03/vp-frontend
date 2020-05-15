import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { connect, createLocalTracks } from "twilio-video";
import { DeviceService } from "./videocall/settings/device.service";
import * as io from "socket.io-client";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  username = "manish";
  room = "testroom1-89";
  authToken = "";
  localTracks = [];
  activeRoom;
  localMediaContainer;
  server_url = "https://vc-k0qs.herokuapp.com/";

  // step 1 set username
  socket;
  activeUsers = [];
  hideUsername = false;
  hideActiveUsers = false;
  callingStatus = false;
  outgoing = false;
  incoming = false;
  user;
  constructor(private http: HttpClient, private deviceService: DeviceService) {}

  ngOnInit() {}

  //step 1
  setUsername() {
    this.hideUsername = true;
    // socket init
    this.socket = io(this.server_url).emit("join", { user: this.username });

    // active users
    this.socket.on("status", (data) => {
      this.activeUsers = data.filter((user) => user != this.username);
    });

    //incoming Call
    this.socket.on("incomingCall", (data) => {
      this.hideActiveUsers = true;
      this.callingStatus = true;
      this.outgoing = false;
      this.incoming = true;
      this.user = data.user;
    });

    // chat initialized
    this.socket.on("callInitalized", (data) => {
      this.callingStatus = false;
      console.log("Calling Accepted", data);
      this.room = data.roomname;
      this.authToken = data.authToken;
      this.callInit();
    });
  }

  //step2
  initiateCall(user) {
    this.hideActiveUsers = true;
    this.callingStatus = true;
    this.incoming = false;
    this.outgoing = true;
    this.user = user;
    this.socket.emit("outgoingCall", { srcUser: this.username, dstUser: user });
  }

  // accept call
  acceptCall() {
    this.callingStatus = false;
    this.incoming = false;
    this.outgoing = true;
    this.socket.emit("callAccepted", {
      srcUser: this.username,
      dstUser: this.user,
    });
  }

  // start call
  callInit() {
    console.log("load");
    // start local track
    this.deviceService.init("audio");
    this.deviceService.init("video",);
    this.deviceService.videoTrack.subscribe(async (track) => {
      if (track) {
        this.deviceService.attachTrack("local-media", track);
        let localTracks = this.deviceService.getLocalTracks(["audio", "video"]);
        this.activeRoom = await this.connectToRoom(
          this.room,
          this.authToken,
          localTracks
        );

        const localParticipant = this.activeRoom.localParticipant;
        console.log(
          `Connected to the Room as LocalParticipant "${localParticipant.identity}"`
        );

        // Log any Participants already connected to the Room
        this.activeRoom.participants.forEach((participant) => {
          console.log(
            `Participant "${participant.identity}" is connected to the Room`
          );
          this.getRemoteTracks(participant);
        });

        // Log new Participants as they connect to the Room
        this.activeRoom.once("participantConnected", (participant) => {
          console.log(
            `Participant "${participant.identity}" has connected to the Room`
          );
          this.getRemoteTracks(participant);
        });

        // Log Participants as they disconnect from the Room
        this.activeRoom.once("participantDisconnected", (participant) => {
          console.log(
            `Participant "${participant.identity}" has disconnected from the Room`
          );
          // document.getElementById('remote-media').innerHTML = null;
        });
      }
    });
  }

  connectToRoom(room, token, localTracks) {
    return connect(token, {
      name: room,
      tracks: localTracks,
    });
  }

  joinRoom(token, roomname, localtracks) {}

  getRemoteTracks(participant) {
    console.log(participant,participant.tracks);
    participant.tracks.forEach((publication) => {
      if (publication.isSubscribed) {
        console.log("Yes");
        const track = publication.track;
        document.getElementById("remote-media").appendChild(track.attach());
      }
    });
    participant.on("trackSubscribed", (track) => {
        document.getElementById("remote-media").appendChild(track.attach());
    });
  }



















  // // step 1
  // async getToken() {
  //   let response = await this.http
  //     .post(`${this.server_url}token`, {
  //       room: "roomname",
  //       user: this.username,
  //     })
  //     .toPromise();
  //   this.authToken = response["auth"];
  //   console.log("Got Token ", this.authToken);
  // }

  // // step2 optional
  // async setLocalTracksAsActive() {
  //   let element = document.getElementById("local-media");
  //   let options = { height: element.clientHeight, width: element.clientWidth };
  //   this.localTracks = await this.getLocalTracks(options);
  //   // index == 0 ; audio
  //   // index == 1 ; camera
  //   console.log(this.localTracks);

  //   this.localMediaContainer = element;
  //   let localCameraTrack = this.localTracks[1];
  //   // local media preview
  //   this.localMediaContainer.appendChild(localCameraTrack.attach());
  // }

  // // step 3 Connect
  // async connectToRoom() {
  //   console.log("Local Tracks ", this.localTracks);
  //   // joinRoom
  //   this.activeRoom = await this.joinRoom(
  //     this.authToken,
  //     this.room,
  //     this.localTracks
  //   );
  //   console.log(this.activeRoom);
  //   this.getParticipants(this.activeRoom);
  // }

  // // step 4
  // // participants
  // getParticipants(room) {
  //   room.once("participantConnected", (participant) => {
  //     this.getRemoteTracks(participant);
  //   });
  // }

  // // helper function
  // // join room
  // joinRoom(token, roomname, localtracks) {
  //   return connect(token, {
  //     name: roomname,
  //     tracks: localtracks,
  //     dominantSpeaker: this.isSpeaker,
  //   });
  // }

  // // create tracks
  // getLocalTracks(options) {
  //   return createLocalTracks({
  //     audio: { name: "microphone" },
  //     video: {
  //       name: "camera",
  //       height: options["height"],
  //       width: options["width"],
  //     },
  //   });
  // }

  // getRemoteTracks(participant) {
  //   participant.tracks.forEach((publication) => {
  //     if (publication.isSubscribed) {
  //       const track = publication.track;
  //       document.getElementById("remote-media").appendChild(track.attach());
  //     }
  //   });
  //   participant.on("trackSubscribed", (track) => {
  //     document.getElementById("remote-media").appendChild(track.attach());
  //   });
  // }
}
