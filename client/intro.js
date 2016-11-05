import _ from 'lodash'
import Credits from './credits';
import {SpriteText2D, textAlign} from './lib/text2d/index'
import DebugUtil from './util/debug'

export default class Intro {
    constructor(camera, square, timeConroller, soundManager, scene) {
        this.camera = camera;
        this.square = square;
        this.soundManager = soundManager;
        this.timeConroller = timeConroller;
        this.scene = scene;

        this.soundEvents = [
            {
                time: 10.283,
                action: () => {
                    this.showTitle()
                }
            },
            {
                time: 21.3,
                action: () => {
                    this.hideTitle();
                    this.bringUpSun();
                }
            },
            {
                time: 55.3,
                action: () => {
                    this.endIntro();
                }
            }
        ]

        
        this.INTRO_SOUND = 'assets/sound/INTRO_Shirin.ogg'


    }

    init(loadingManager) {
        // Put the camera in the starting position
//        events.emit("intro_start");
        // events.emit("add_gui",{}, this.camera.position, "y"); 
        
       /*

        let titlePlaneGeo = new THREE.PlaneGeometry( 512, 128 );
        let loader = new THREE.TextureLoader(loadingManager);
        loader.load('assets/intro/title.png', (texture) => {
            this.titleTexture = texture;
            let material = new THREE.MeshBasicMaterial( {map: this.titleTexture, side: THREE.DoubleSide, transparent:true}  );
            this.titlePlane = new THREE.Mesh(titlePlaneGeo, material);
            this.titlePlane.position.copy(this.square.getCenterPosition());
            this.titlePlane.position.y = 400;
        });*/


        let CREDIT_TEXT_TITLE = {
             align: textAlign.center, 
             font: '20px Miriam Libre',
             fillStyle: '#FFFFFF',
             antialias: true 
        }
        let CREDIT_TEXT_NAME = {
             align: textAlign.center, 
             font: 'bold 26px Miriam Libre',
             fillStyle: '#FFFFFF',
             antialias: true 
        }
        let CREDIT_TEXT_SCALE = 0.0005;

        this.creditTextTitle = new SpriteText2D("", CREDIT_TEXT_TITLE);
        this.creditTextTitle.scale.multiplyScalar(CREDIT_TEXT_SCALE);
        this.creditTextTitle.position.set(-0.02,-0.16,-0.5);
        this.creditTextTitle.material.opacity = 0;
        this.camera.add(this.creditTextTitle);

        this.creditTextName = new SpriteText2D("", CREDIT_TEXT_NAME);
        this.creditTextName.scale.multiplyScalar(CREDIT_TEXT_SCALE);
        this.creditTextName.position.set(-0.02,-0.18,-0.5);
        this.creditTextName.material.opacity = 0;
        this.camera.add(this.creditTextName);

    }
    start() {
        // Load the sound
        //
        this.soundManager.loadSound(this.INTRO_SOUND)
        .then((sound) => {
            console.log("Sound ", sound);
            this.sound = sound;

            setTimeout(() => {
                
        //        this.turnOnWindows();
                this.playSound(); 
                //this.zoomToSquare();

            },3000);
        }); 
    }

    bringUpSun() {
        this.timeConroller.transitionTo(17, 37);
    }

    playSound() {
        this.sound.playIn(1);
        this.currentEvent = this.soundEvents.shift();
        //this.bringUpSun();
    }

    showTitle() {
        this.scene.add(this.titlePlane);
    }
    hideTitle() {
        this.scene.remove(this.titlePlane);
    }

    turnOnWindows() {
        let shuffledWindows = _.shuffle(this.square.windows.children);
        console.log("INTRO: TURN ON  WINDOWS");
        let index = {
            value: 0
        }
        let lastIndex = 0;
        TweenMax.to(index, 50, {value: Math.floor((shuffledWindows.length - 1) / 3), ease: Circ.easeIn, onUpdate: (val) => {
            let currentIndex = Math.ceil(index.value);
            for (let i = lastIndex + 1; i <= currentIndex; i++) {
                shuffledWindows[i].visible = true;
            }
            lastIndex = currentIndex;
        }});
    }

    turnOffWindows() {
        let litWindows = _.filter(this.square.windows.children, _.matchesProperty('visible', true));
        console.log("INTRO: TURN OFF " + litWindows.length + "  WINDOWS");
        let index = {
            value: 0
        }
        let lastIndex = 0;
        TweenMax.to(index, 6, {value:litWindows.length - 1, ease: Circ.easeIn, onUpdate: (val) => {
            let currentIndex = Math.ceil(index.value);
            for (let i = lastIndex + 1; i <= currentIndex; i++) {
                litWindows[i].visible = false;
            }
            lastIndex = currentIndex;
        }});
    }

    endIntro() {
        setTimeout(() => {
            console.log("END INTRO");
            events.emit("intro_end");
        },5000)
    }

    update() {
        if (this.sound && this.sound.isPlaying && this.currentEvent) {
            if (this.sound.getCurrentTime() >= this.currentEvent.time) {
                this.currentEvent.action();
                if (this.soundEvents.length > 0) {
                    this.currentEvent = this.soundEvents.shift();
                } else {
                    this.currentEvent = null;
                }
            }
        }
    }

    playCredits() {
        this.currentCredit = 0;
        this.showNextCredit();
    }

    showNextCredit() {
        let name = Credits.credits[this.currentCredit].Name;
        let title = Credits.credits[this.currentCredit].Role;
        
        this.creditTextTitle.text = title;
        this.creditTextName.text = name;

        TweenMax.to( this.creditTextName.material, 1, { opacity: 1});
        TweenMax.to( this.creditTextTitle.material, 1, { opacity: 1, 
            onComplete: () => {
                setTimeout(() => {
                   this.hideCredit();
                },2500);
            } 
        });

    }

    hideCredit() {
        TweenMax.to( this.creditTextName.material, 1, { opacity: 0});
        TweenMax.to( this.creditTextTitle.material, 1, { opacity: 0, 
            onComplete: () => {
                this.currentCredit++;
                if (this.currentCredit < Credits.credits.length) {
                    this.showNextCredit();
                } else {
                    this.camera.remove(this.creditTextTitle);
                    this.camera.remove(this.creditTextName);
                }
            } 
        });
    }
}