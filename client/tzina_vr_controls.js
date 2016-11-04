/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 * @author avnerus / http://avner.js.org
 */
export default function ( emitter, object, onError ) {

	var scope = this;

	var vrInput;

	var standingMatrix = new THREE.Matrix4();

	function gotVRDevices( devices ) {

		for ( var i = 0; i < devices.length; i ++ ) {

			if ( ( 'VRDisplay' in window && devices[ i ] instanceof VRDisplay ) ||
				 ( 'PositionSensorVRDevice' in window && devices[ i ] instanceof PositionSensorVRDevice ) ) {

				vrInput = devices[ i ];
				break;  // We keep the first we encounter

			}

		}

		if ( !vrInput ) {

			if ( onError ) onError( 'VR input not available.' );

		}

	}

	if ( navigator.getVRDisplays ) {

		navigator.getVRDisplays().then( gotVRDevices );

	} else if ( navigator.getVRDevices ) {

		// Deprecated API.
		navigator.getVRDevices().then( gotVRDevices );

	}

	// the Rift SDK returns the position in meters
	// this scale factor allows the user to define how meters
	// are converted to scene units.

	this.scale = 1;

	// If true will use "standing space" coordinate system where y=0 is the
	// floor and x=0, z=0 is the center of the room.
	this.standing = true;

	// Distance from the users eyes to the floor in meters. Used when
	// standing=true but the VRDisplay doesn't provide stageParameters.
	this.userHeight = 22.1;

    this.active = true;

    this.basePosition = new THREE.Vector3(0,0,0);

    events.on("control_threshold", (passed) => {
        if (passed) {
            this.active = true;
        } else {
            this.active = false;
        }        
    })

	this.update = function () {

        if (this.active) {
            if ( vrInput ) {

                if ( vrInput.getPose ) {

                    var pose = vrInput.getPose();

                    if ( pose.orientation !== null ) {

                        object.quaternion.fromArray( pose.orientation );

                    }

                    if ( pose.position !== null ) {

                        object.position.fromArray(pose.position).multiplyScalar(this.scale).add(this.basePosition);
                        
                        if ( this.standing ) {

                            if ( vrInput.stageParameters ) {
                            	
                                object.updateMatrix();

                                standingMatrix.fromArray(vrInput.stageParameters.sittingToStandingTransform);

                                object.applyMatrix( standingMatrix );

                            } else {

                                object.position.setY( object.position.y + this.userHeight );

                            }

                        }

                        object.position.multiplyScalar( scope.scale );

                    }

                } else {

                    // Deprecated API.
                    var state = vrInput.getState();

                    if ( state.orientation !== null ) {

                        object.quaternion.copy( state.orientation );

                    }

                    if ( state.position !== null ) {

                        object.position.copy( state.position );

                    } 
                }

            }
        }
	};

	this.resetPose = function () {

		if ( vrInput ) {

			if ( vrInput.resetPose !== undefined ) {

				vrInput.resetPose();

			} else if ( vrInput.resetSensor !== undefined ) {

				// Deprecated API.
				vrInput.resetSensor();

			} else if ( vrInput.zeroSensor !== undefined ) {

				// Really deprecated API.
				vrInput.zeroSensor();

			}

		}

	};

	this.resetSensor = function () {

		console.warn( 'THREE.VRControls: .resetSensor() is now .resetPose().' );
		this.resetPose();

	};

	this.zeroSensor = function () {

		console.warn( 'THREE.VRControls: .zeroSensor() is now .resetPose().' );
		this.resetPose();

	};

	this.dispose = function () {

		vrInput = null;

	};

};