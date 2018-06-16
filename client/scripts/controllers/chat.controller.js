import Ionic from 'ionic-scripts';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import { MeteorCameraUI } from 'meteor/okland:camera-ui';
import { Controller } from 'angular-ecmascript/module-helpers';
import { Chats, Messages } from '../../../lib/collections';
var _lplay;
var currNote = 1;
var currSignature = 4;
var timer = [];
var tempo = 168;

export default class ChatCtrl extends Controller {
  constructor() {
    super(...arguments);

    this.chatId = this.$stateParams.chatId;
    this.isIOS = Ionic.Platform.isWebView() && Ionic.Platform.isIOS();
    this.isCordova = Meteor.isCordova;
    this.bpm = 60;
    this.quarter = true;
    this.eigth = true;
    this.triplet = false;

    _lplay = false;

    this.helpers({
      data() {
        return Chats.findOne(this.chatId);
      },
      messages() {
        return Messages.find({ chatId: this.chatId });
      },
    });

    this.autoScroll();
  }

  sendPicture() {
    MeteorCameraUI.getPicture({}, (err, data) => {
      if (err) return this.handleError(err);

      this.callMethod('newMessage', {
        picture: data,
        type: 'picture',
        chatId: this.chatId
      });
    });
  }

  toggleSound(){
    var sound = new Howl({
      urls: ['/mp3/snare.mp3', '/mp3/snare.mp3'],
      sprite: {
        tic: [0, 2000],
        toc: [0, 2000]
      }
    });
    tempo = parseInt(this.bpm)

    function click(){
        if(currNote === 1){
            sound.play('tic');
        } else {
          if(currNote === 4){
            currNote = 0;
          }
            sound.play('toc');
        }
        currNote++;
    }

    function start(){
      $.each(timer, function (i, item){
        clearTimeout(item);
      });
      queue(tempo);
    }

    function stop(){
      $.each(timer, function (i, item){
        clearTimeout(item);
      })
    }

    function queue(tempo){
        var qms = Math.round(((60/tempo)*1000)*100000) / 100000;

        console.log("ms set in timeout: ", qms/2)
        //can not set timeout less than 400 ms
        //check to make sure sub division isn't shorter than that
        //if it is for 8ths temp*2 then push second time at 1.5* its speed
        //for triplet multiple *3 and push 3 timers
        var eigth = $("#eigthCheckbox").prop("checked")
        var triplet = $("#tripletCheckbox").prop("checked")
        var test = qms/2
        var ttest = qms/3
        debugger

        interval = setInterval(click, (60000 / tempo) / 2);


    }
    _lplay = !_lplay;

    if(_lplay){
      start();
    }else{
      stop()
    }

  }


  sendMessage() {
    if (_.isEmpty(this.message)) return;
     this.bpm = this.message;
     this.callMethod('newMessage', {
       text: this.message,
       type: 'text',
       chatId: this.chatId
     });


     delete this.message;
  }

  inputUp () {
    if (this.isIOS) {
      this.keyboardHeight = 216;
    }

    this.scrollBottom(true);
  }

  inputDown () {
    if (this.isIOS) {
      this.keyboardHeight = 0;
    }

    this.$ionicScrollDelegate.$getByHandle('chatScroll').resize();
  }

  closeKeyboard () {
    if (this.isCordova) {
      cordova.plugins.Keyboard.close();
    }
  }

  autoScroll() {
  let recentMessagesNum = this.messages.length;

  this.autorun(() => {
    const currMessagesNum = this.getCollectionReactively('messages').length;
    const animate = recentMessagesNum != currMessagesNum;
    recentMessagesNum = currMessagesNum;
    this.scrollBottom(animate);
  });
}

  scrollBottom(animate) {
    this.$timeout(() => {
      this.$ionicScrollDelegate.$getByHandle('chatScroll').scrollBottom(animate);
    }, 300);
  }

  handleError(err) {
    if (err.error == 'cancel') return;
    this.$log.error('Profile save error ', err);

    this.$ionicPopup.alert({
      title: err.reason || 'Save failed',
      template: 'Please try again',
      okType: 'button-positive button-clear'
    });
  }
}

ChatCtrl.$name = 'ChatCtrl';
ChatCtrl.$inject = ['$stateParams', '$timeout', '$ionicScrollDelegate', '$ionicPopup', '$log'];
